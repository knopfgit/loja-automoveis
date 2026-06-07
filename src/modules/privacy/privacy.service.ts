import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { AppException } from '../../common/exceptions/app.exception';
import { ClientInfo } from '../../common/decorators/client-info.decorator';
import { PaginatedResult } from '../../common/dto/paginated-result';
import {
  LocationTrackingDto,
  MarketingPreferenceDto,
  RegisterConsentDto,
  VehicleViewDto,
} from './dto/privacy.dto';

@Injectable()
export class PrivacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
  ) {}

  // ----------------------------------------------------------- consents
  async registerConsent(
    dto: RegisterConsentDto,
    client: ClientInfo,
    customerId?: string,
  ) {
    const created = await this.prisma.$transaction(
      dto.consents.map((c) =>
        this.prisma.cookieConsent.create({
          data: {
            customerId,
            sessionId: dto.sessionId,
            category: c.category,
            granted: c.granted,
            termsVersion: dto.termsVersion,
            ipHash: client.ipHash,
            userAgent: client.userAgent,
          },
        }),
      ),
    );
    // Keep the customer marketing/cookie snapshot in sync.
    if (customerId) {
      const marketing = dto.consents.find((c) => c.category === 'MARKETING');
      const essential = dto.consents.find((c) => c.category === 'ESSENTIAL');
      await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          marketingConsent: marketing ? marketing.granted : undefined,
          cookieConsent: essential ? essential.granted : true,
        },
      });
    }
    return { registered: created.length };
  }

  async getMyConsents(customerId?: string, sessionId?: string) {
    if (!customerId && !sessionId) {
      throw new AppException(
        'VALIDATION_ERROR',
        'customerId ou sessionId requerido.',
      );
    }
    const all = await this.prisma.cookieConsent.findMany({
      where: { customerId, sessionId },
      orderBy: { createdAt: 'desc' },
    });
    // Latest per category.
    const latest: Record<string, any> = {};
    for (const c of all) {
      if (!latest[c.category]) latest[c.category] = c;
    }
    return Object.values(latest);
  }

  // ----------------------------------------------------------- tracking
  async trackVehicleView(
    dto: VehicleViewDto,
    client: ClientInfo,
    customerId?: string,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    await this.prisma.$transaction([
      this.prisma.vehicleView.create({
        data: {
          vehicleId: dto.vehicleId,
          customerId,
          sessionId: dto.sessionId,
          ipHash: client.ipHash,
          userAgent: client.userAgent,
          sourcePage: dto.sourcePage,
        },
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    this.realtime.emit(
      EVENTS.VEHICLE_VIEWED,
      { vehicleId: dto.vehicleId },
      { roles: ['ADMIN'] },
    );
    return { success: true };
  }

  async trackLocation(
    dto: LocationTrackingDto,
    client: ClientInfo,
    customerId?: string,
  ) {
    // Only store location when a LOCATION consent has been granted.
    const consent = await this.prisma.cookieConsent.findFirst({
      where: {
        category: 'LOCATION',
        granted: true,
        OR: [{ customerId }, { sessionId: dto.sessionId }],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!consent) {
      throw new AppException(
        'FORBIDDEN',
        'Consentimento de localização não concedido.',
      );
    }
    await this.prisma.cookieConsent.create({
      data: {
        customerId,
        sessionId: dto.sessionId,
        category: 'LOCATION',
        granted: true,
        ipHash: client.ipHash,
        userAgent: client.userAgent,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return { success: true };
  }

  // ----------------------------------------------------------- favorites
  async addFavorite(customerId: string, vehicleId: string) {
    const exists = await this.prisma.favorite.findUnique({
      where: { customerId_vehicleId: { customerId, vehicleId } },
    });
    if (exists) return exists;
    const [favorite] = await this.prisma.$transaction([
      this.prisma.favorite.create({ data: { customerId, vehicleId } }),
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);
    return favorite;
  }

  async removeFavorite(customerId: string, vehicleId: string) {
    const exists = await this.prisma.favorite.findUnique({
      where: { customerId_vehicleId: { customerId, vehicleId } },
    });
    if (!exists) return { success: true };
    await this.prisma.$transaction([
      this.prisma.favorite.delete({
        where: { customerId_vehicleId: { customerId, vehicleId } },
      }),
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);
    return { success: true };
  }

  async listFavorites(customerId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { customerId },
      include: {
        vehicle: {
          include: { media: { where: { isMain: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites;
  }

  async myViewHistory(customerId: string, page: number, limit: number) {
    const where = { customerId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicleView.findMany({
        where,
        include: {
          vehicle: { select: { brand: true, model: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicleView.count({ where }),
    ]);
    return PaginatedResult.of(items, total, page, limit);
  }

  // ----------------------------------------------------------- marketing
  async setMarketingPreferences(
    customerId: string,
    dto: MarketingPreferenceDto,
  ) {
    // Never persist a client-supplied customerId (mass-assignment guard).
    const { customerId: _ignore, ...data } = dto as MarketingPreferenceDto & {
      customerId?: string;
    };
    const pref = await this.prisma.marketingPreference.upsert({
      where: { customerId },
      create: { customerId, ...data },
      update: data,
    });
    if (dto.emailOptIn !== undefined) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { marketingConsent: dto.emailOptIn },
      });
    }
    return pref;
  }

  // ----------------------------------------------------------- privacy
  async requestExport(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        favorites: true,
        marketingPreference: true,
        cookieConsents: true,
        vehicleViews: true,
        leads: true,
      },
    });
    if (!customer) throw new AppException('CUSTOMER_NOT_FOUND');

    const request = await this.prisma.privacyRequest.create({
      data: {
        customerId,
        type: 'EXPORT',
        status: 'COMPLETED',
        processedAt: new Date(),
        payload: JSON.parse(JSON.stringify(customer)),
      },
    });
    await this.audit.log({
      actorId: customer.userId,
      action: 'EXPORT',
      entity: 'Customer',
      entityId: customerId,
      reason: 'lgpd_export',
    });
    return { requestId: request.id, data: request.payload };
  }

  async requestDeletion(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new AppException('CUSTOMER_NOT_FOUND');

    const request = await this.prisma.privacyRequest.create({
      data: { customerId, type: 'DELETE', status: 'PENDING' },
    });
    await this.audit.log({
      actorId: customer.userId,
      action: 'UPDATE',
      entity: 'Customer',
      entityId: customerId,
      reason: 'lgpd_delete_requested',
    });
    return {
      requestId: request.id,
      status: 'PENDING',
      message:
        'Solicitação registrada. A anonimização será processada pelo job de privacidade.',
    };
  }
}
