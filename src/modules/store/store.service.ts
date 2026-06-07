import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getConfig() {
    const store = await this.prisma.store.findFirst();
    if (!store) throw new AppException('STORE_NOT_CONFIGURED');
    return store;
  }

  /** Single-store upsert (creates if none exists). */
  async upsert(dto: any, actorId?: string) {
    const existing = await this.prisma.store.findFirst();
    const data: Prisma.StoreUncheckedCreateInput = {
      name: dto.name,
      cnpj: dto.cnpj,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      email: dto.email,
      street: dto.street,
      number: dto.number,
      complement: dto.complement,
      district: dto.district,
      zipCode: dto.zipCode,
      city: dto.city,
      state: dto.state,
      latitude: dto.latitude,
      longitude: dto.longitude,
      openingHours: dto.openingHours,
      googleMapsUrl: dto.googleMapsUrl,
      directionsUrl: dto.directionsUrl,
      socialLinks: dto.socialLinks,
      integrations: dto.integrations,
    };

    const store = existing
      ? await this.prisma.store.update({ where: { id: existing.id }, data })
      : await this.prisma.store.create({ data });

    await this.audit.log({
      actorId,
      action: existing ? 'UPDATE' : 'CREATE',
      entity: 'Store',
      entityId: store.id,
    });
    return store;
  }

  /** Public-safe location payload for maps and routing. */
  async getLocation() {
    const store = await this.prisma.store.findFirst();
    if (!store) throw new AppException('STORE_NOT_CONFIGURED');

    const hasCoords = store.latitude != null && store.longitude != null;
    const directionsUrl =
      store.directionsUrl ||
      (hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
        : undefined);
    const googleMapsUrl =
      store.googleMapsUrl ||
      (hasCoords
        ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
        : undefined);

    return {
      name: store.name,
      phone: store.phone,
      whatsapp: store.whatsapp,
      email: store.email,
      address: {
        street: store.street,
        number: store.number,
        complement: store.complement,
        district: store.district,
        zipCode: store.zipCode,
        city: store.city,
        state: store.state,
      },
      coordinates: hasCoords
        ? { latitude: store.latitude, longitude: store.longitude }
        : null,
      openingHours: store.openingHours,
      googleMapsUrl,
      directionsUrl,
      socialLinks: store.socialLinks,
    };
  }
}
