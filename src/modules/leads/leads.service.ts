import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { onlyDigits } from '../../common/validators/br-document.util';
import {
  AddInteractionDto,
  SpecialistContactDto,
  UpdateLeadStatusDto,
} from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Picks the seller to assign a lead to.
   *  - round_robin: the active seller whose most recent lead is the oldest
   *  - least_busy : the active seller with the fewest open (non-final) leads
   */
  private async pickSeller() {
    const strategy = this.config.get<string>(
      'business.leadAssignmentStrategy',
      'round_robin',
    );
    const sellers = await this.prisma.employee.findMany({
      where: { active: true, user: { role: 'SELLER', status: 'ACTIVE' } },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!sellers.length) return null;

    const openCounts = await Promise.all(
      sellers.map(async (s) => ({
        seller: s,
        open: await this.prisma.lead.count({
          where: {
            assignedSellerId: s.id,
            status: { in: ['NEW', 'ASSIGNED', 'CONTACTED', 'NEGOTIATING'] },
          },
        }),
        last: await this.prisma.lead.findFirst({
          where: { assignedSellerId: s.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      })),
    );

    if (strategy === 'least_busy') {
      openCounts.sort((a, b) => a.open - b.open);
    } else {
      // round robin: oldest last-assignment first (nulls = never assigned first)
      openCounts.sort((a, b) => {
        const at = a.last?.createdAt?.getTime() ?? 0;
        const bt = b.last?.createdAt?.getTime() ?? 0;
        return at - bt;
      });
    }
    return openCounts[0].seller;
  }

  private buildWhatsappUrl(number: string, message: string): string {
    const cc = this.config.get<string>('business.whatsappCountryCode', '55');
    let digits = onlyDigits(number);
    if (!digits.startsWith(cc)) digits = `${cc}${digits}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  async specialistContact(dto: SpecialistContactDto) {
    const vehicle = dto.vehicleId
      ? await this.prisma.vehicle.findUnique({
          where: { id: dto.vehicleId },
          select: {
            id: true,
            brand: true,
            model: true,
            modelYear: true,
            publicCode: true,
          },
        })
      : null;

    const seller = await this.pickSeller();
    const store = await this.prisma.store.findFirst();

    const vehicleLabel = vehicle
      ? `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} (${vehicle.publicCode})`
      : 'um veículo';
    const message =
      dto.message || `Olá! Tenho interesse em ${vehicleLabel}. Pode me ajudar?`;

    const contactNumber =
      seller?.whatsapp || store?.whatsapp || store?.phone || '';
    const whatsappUrl = contactNumber
      ? this.buildWhatsappUrl(contactNumber, message)
      : null;

    const lead = await this.prisma.lead.create({
      data: {
        vehicleId: vehicle?.id,
        customerId: dto.customerId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        origin: dto.origin ?? 'SPECIALIST_BUTTON',
        sourcePage: dto.sourcePage,
        assignedSellerId: seller?.id,
        initialMessage: message,
        whatsappUrl: whatsappUrl ?? undefined,
        status: seller ? 'ASSIGNED' : 'NEW',
      },
    });

    if (vehicle) {
      await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { contactCount: { increment: 1 } },
      });
    }

    await this.audit.log({
      action: 'CREATE',
      entity: 'Lead',
      entityId: lead.id,
      source: 'api',
      after: { vehicleId: vehicle?.id, assignedSellerId: seller?.id },
    });

    // Realtime + notification to the assigned seller.
    this.realtime.emit(
      EVENTS.LEAD_CREATED,
      { id: lead.id },
      { roles: ['ADMIN'] },
    );
    if (seller) {
      this.realtime.emit(
        EVENTS.LEAD_ASSIGNED,
        { id: lead.id, vehicle: vehicleLabel },
        { roles: ['ADMIN'], sellerId: seller.id },
      );
      if (seller.user) {
        await this.notifications.create({
          userId: seller.user.id,
          type: EVENTS.LEAD_ASSIGNED,
          title: 'Nova oportunidade de atendimento',
          body: `${dto.name} (${dto.phone}) - ${vehicleLabel}`,
          data: { leadId: lead.id, vehicleId: vehicle?.id },
          email: {
            to: seller.user.email,
            template: 'lead-assigned',
            context: {
              name: dto.name,
              phone: dto.phone,
              vehicle: vehicleLabel,
            },
          },
        });
      }
    }

    return {
      leadId: lead.id,
      assignedSeller: seller ? { id: seller.id, name: seller.fullName } : null,
      whatsappUrl,
      status: lead.status,
    };
  }

  async findAll(
    pg: PaginationQueryDto,
    filters: { status?: string; sellerId?: string },
  ) {
    const where: Prisma.LeadWhereInput = {
      status: filters.status as any,
      assignedSellerId: filters.sellerId,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        include: {
          vehicle: { select: { brand: true, model: true, publicCode: true } },
          assignedSeller: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(
    id: string,
    user?: { role: string; employeeId?: string | null },
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        interactions: { orderBy: { createdAt: 'desc' } },
        vehicle: true,
      },
    });
    if (!lead) throw new AppException('LEAD_NOT_FOUND');
    if (user?.role === 'SELLER' && lead.assignedSellerId !== user.employeeId) {
      throw new AppException('FORBIDDEN');
    }
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto, actorId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new AppException('LEAD_NOT_FOUND');

    const data: Prisma.LeadUpdateInput = {
      status: dto.status,
      notes: dto.notes,
    };
    if (dto.status === 'CONTACTED' && !lead.firstContactAt) {
      data.firstContactAt = new Date();
    }
    if (dto.status === 'CONVERTED') data.convertedAt = new Date();

    const updated = await this.prisma.lead.update({ where: { id }, data });
    await this.prisma.leadInteraction.create({
      data: {
        leadId: id,
        type: 'status_change',
        content: `Status -> ${dto.status}`,
        authorId: actorId,
      },
    });
    await this.audit.log({
      actorId,
      action: 'STATUS_CHANGE',
      entity: 'Lead',
      entityId: id,
      after: { status: dto.status },
    });
    return updated;
  }

  async addInteraction(id: string, dto: AddInteractionDto, actorId?: string) {
    await this.prisma.lead.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new AppException('LEAD_NOT_FOUND');
    });
    return this.prisma.leadInteraction.create({
      data: {
        leadId: id,
        type: dto.type,
        content: dto.content,
        authorId: actorId,
      },
    });
  }
}
