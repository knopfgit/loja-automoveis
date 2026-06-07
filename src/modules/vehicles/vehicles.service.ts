import { Injectable } from '@nestjs/common';
import { Prisma, SpecSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { publicCode, slugify } from '../../common/utils/string.util';
import { VehicleSpecsService } from '../vehicle-specs/vehicle-specs.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import {
  ApplySpecsDto,
  MediaItemDto,
  UpdateVehicleDto,
  UpsertSpecDto,
  VehicleQueryDto,
} from './dto/vehicle-extra.dto';
import { toPublicVehicle } from './vehicles.serializer';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly specsService: VehicleSpecsService,
  ) {}

  private async uniqueSlug(base: string): Promise<string> {
    const root = slugify(base) || 'veiculo';
    let candidate = root;
    let i = 1;
    while (
      await this.prisma.vehicle.findUnique({ where: { slug: candidate } })
    ) {
      candidate = `${root}-${i++}`;
    }
    return candidate;
  }

  async create(dto: CreateVehicleDto, actorId?: string) {
    const slug = await this.uniqueSlug(
      `${dto.brand}-${dto.model}-${dto.version ?? ''}-${dto.modelYear}`,
    );

    const vehicle = await this.prisma.vehicle.create({
      data: {
        publicCode: publicCode(),
        slug,
        brand: dto.brand,
        model: dto.model,
        version: dto.version,
        manufactureYear: dto.manufactureYear,
        modelYear: dto.modelYear,
        plate: dto.plate?.toUpperCase(),
        renavam: dto.renavam,
        chassis: dto.chassis?.toUpperCase(),
        engineNumber: dto.engineNumber,
        category: dto.category,
        bodyType: dto.bodyType,
        color: dto.color,
        fuel: dto.fuel,
        transmission: dto.transmission,
        doors: dto.doors,
        mileage: dto.mileage,
        seats: dto.seats,
        condition: dto.condition,
        origin: dto.origin,
        purchasePrice: dto.purchasePrice,
        suggestedPrice: dto.suggestedPrice,
        announcedPrice: dto.announcedPrice,
        minPrice: dto.minPrice,
        featured: dto.featured ?? false,
        availableForAd: dto.availableForAd ?? false,
        internalNotes: dto.internalNotes,
        publicDescription: dto.publicDescription,
        createdById: actorId,
        // Seed an empty DRE for the vehicle.
        dre: { create: {} },
      },
      include: { spec: true, media: true },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Vehicle',
      entityId: vehicle.id,
      after: { brand: dto.brand, model: dto.model, modelYear: dto.modelYear },
    });

    this.realtime.emit(
      EVENTS.VEHICLE_CREATED,
      { id: vehicle.id, brand: vehicle.brand, model: vehicle.model },
      { roles: ['ADMIN', 'SELLER'] },
    );

    return vehicle;
  }

  async findAll(query: VehicleQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      brand: query.brand
        ? { equals: query.brand, mode: 'insensitive' }
        : undefined,
      model: query.model
        ? { contains: query.model, mode: 'insensitive' }
        : undefined,
      status: query.status,
      fuel: query.fuel,
      transmission: query.transmission,
      color: query.color
        ? { contains: query.color, mode: 'insensitive' }
        : undefined,
      category: query.category,
      featured:
        query.featured === undefined ? undefined : query.featured === 'true',
      modelYear: this.range(query.yearMin, query.yearMax),
      announcedPrice: this.decimalRange(query.priceMin, query.priceMax),
      ...(query.search
        ? {
            OR: [
              { brand: { contains: query.search, mode: 'insensitive' } },
              { model: { contains: query.search, mode: 'insensitive' } },
              { plate: { contains: query.search, mode: 'insensitive' } },
              { publicCode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.VehicleOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        include: { spec: true, media: true },
        orderBy,
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return PaginatedResult.of(items, total, query.page, query.limit);
  }

  private range(min?: number, max?: number) {
    if (min === undefined && max === undefined) return undefined;
    return { gte: min, lte: max };
  }
  private decimalRange(min?: number, max?: number) {
    if (min === undefined && max === undefined) return undefined;
    return { gte: min, lte: max };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        spec: true,
        media: { orderBy: { position: 'asc' } },
        dre: true,
      },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...dto,
        plate: dto.plate?.toUpperCase(),
        chassis: dto.chassis?.toUpperCase(),
      },
      include: { spec: true, media: true },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Vehicle',
      entityId: id,
      before,
      after: updated,
    });
    this.realtime.emit(
      EVENTS.VEHICLE_UPDATED,
      { id },
      { roles: ['ADMIN', 'SELLER'] },
    );
    return updated;
  }

  async archive(id: string, reason: string | undefined, actorId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { status: 'ARCHIVED', archiveReason: reason },
    });
    await this.audit.log({
      actorId,
      action: 'ARCHIVE',
      entity: 'Vehicle',
      entityId: id,
      reason,
    });
    return updated;
  }

  // -------------------------------------------------------------- specs
  async applySpecs(id: string, dto: ApplySpecsDto, actorId?: string) {
    await this.findOne(id);
    const result = await this.specsService.search({
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      version: dto.version,
    });

    const base = result?.spec ?? {};
    const overrides = dto.manualOverrides ?? {};
    const source: SpecSource = result
      ? SpecSource.PROVIDER_MOCK
      : SpecSource.MANUAL;

    const fieldSources: Record<string, string> = {};
    Object.keys(base).forEach((k) => (fieldSources[k] = source));
    Object.keys(overrides).forEach((k) => (fieldSources[k] = 'MANUAL'));

    const merged = { ...base, ...overrides };

    const spec = await this.prisma.vehicleSpec.upsert({
      where: { vehicleId: id },
      create: {
        vehicleId: id,
        ...this.pickSpecFields(merged),
        source,
        lastSyncedAt: new Date(),
        fieldSources,
      },
      update: {
        ...this.pickSpecFields(merged),
        source,
        lastSyncedAt: new Date(),
        fieldSources,
      },
    });

    // Mirror a few spec fields back onto the vehicle when provided.
    await this.prisma.vehicle.update({
      where: { id },
      data: {
        fuel: this.mapEnum(merged.fuel) as any,
        transmission: this.mapEnum(merged.transmission) as any,
        doors: merged.doors,
        seats: merged.seats,
      },
    });

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'VehicleSpec',
      entityId: spec.id,
      after: { source, applied: dto, hadProviderResult: !!result },
      reason: 'apply_specs',
    });

    return { spec, source, providerMatched: !!result };
  }

  async upsertSpec(id: string, dto: UpsertSpecDto, actorId?: string) {
    await this.findOne(id);
    const fieldSources: Record<string, string> = {};
    Object.keys(dto).forEach((k) => (fieldSources[k] = 'MANUAL'));
    const spec = await this.prisma.vehicleSpec.upsert({
      where: { vehicleId: id },
      create: { vehicleId: id, ...dto, source: 'MANUAL', fieldSources },
      update: { ...dto, source: 'MANUAL' },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'VehicleSpec',
      entityId: spec.id,
      reason: 'manual_spec_edit',
      after: dto,
    });
    return spec;
  }

  private pickSpecFields(s: Record<string, any>) {
    const allowed = [
      'engine',
      'power',
      'torque',
      'displacement',
      'traction',
      'steering',
      'suspension',
      'urbanConsumption',
      'roadConsumption',
      'tankCapacity',
      'trunkCapacity',
      'length',
      'width',
      'height',
      'wheelbase',
      'weight',
      'airbags',
      'brakes',
      'safetyItems',
      'comfortItems',
      'multimedia',
      'options',
      'technicalNotes',
    ];
    const out: Record<string, any> = {};
    for (const key of allowed) if (s[key] !== undefined) out[key] = s[key];
    return out;
  }

  private mapEnum(value?: string) {
    return value ? value.toUpperCase() : undefined;
  }

  // -------------------------------------------------------------- media
  async addMedia(id: string, dto: MediaItemDto, actorId?: string) {
    await this.findOne(id);
    if (dto.isMain) {
      await this.prisma.vehicleMedia.updateMany({
        where: { vehicleId: id, isMain: true },
        data: { isMain: false },
      });
    }
    return this.prisma.vehicleMedia.create({
      data: {
        vehicleId: id,
        url: dto.url,
        type: dto.type ?? 'image',
        isMain: dto.isMain ?? false,
        position: dto.position ?? 0,
        altText: dto.altText,
        uploadedById: actorId,
      },
    });
  }

  async removeMedia(id: string, mediaId: string) {
    const media = await this.prisma.vehicleMedia.findFirst({
      where: { id: mediaId, vehicleId: id },
    });
    if (!media) throw new AppException('NOT_FOUND', 'Mídia não encontrada.');
    await this.prisma.vehicleMedia.delete({ where: { id: mediaId } });
    return { success: true };
  }

  async reorderMedia(
    id: string,
    order: { mediaId: string; position: number }[],
  ) {
    await this.prisma.$transaction(
      order.map((o) =>
        this.prisma.vehicleMedia.updateMany({
          where: { id: o.mediaId, vehicleId: id },
          data: { position: o.position },
        }),
      ),
    );
    return { success: true };
  }

  // -------------------------------------------------------------- metrics
  async incrementView(id: string) {
    await this.prisma.vehicle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // -------------------------------------------------------------- public
  async findPublic(query: VehicleQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      availableForAd: true,
      status: { in: ['AVAILABLE', 'RESERVED'] },
      brand: query.brand
        ? { equals: query.brand, mode: 'insensitive' }
        : undefined,
      model: query.model
        ? { contains: query.model, mode: 'insensitive' }
        : undefined,
      fuel: query.fuel,
      transmission: query.transmission,
      color: query.color
        ? { contains: query.color, mode: 'insensitive' }
        : undefined,
      category: query.category,
      featured:
        query.featured === undefined ? undefined : query.featured === 'true',
      modelYear: this.range(query.yearMin, query.yearMax),
      announcedPrice: this.decimalRange(query.priceMin, query.priceMax),
    };

    const orderBy: Prisma.VehicleOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        include: { spec: true, media: true },
        orderBy,
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return PaginatedResult.of(
      items.map(toPublicVehicle),
      total,
      query.page,
      query.limit,
    );
  }

  async findPublicBySlug(slug: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { slug, availableForAd: true },
      include: { spec: true, media: true },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');
    return toPublicVehicle(vehicle);
  }

  async findFeatured(limit = 8) {
    const items = await this.prisma.vehicle.findMany({
      where: {
        availableForAd: true,
        featured: true,
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      include: { spec: true, media: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
    return items.map(toPublicVehicle);
  }

  async findMostViewed(limit = 8) {
    const items = await this.prisma.vehicle.findMany({
      where: {
        availableForAd: true,
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      include: { spec: true, media: true },
      take: limit,
      orderBy: { viewCount: 'desc' },
    });
    return items.map(toPublicVehicle);
  }

  async publicFilters() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        availableForAd: true,
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      select: {
        brand: true,
        model: true,
        fuel: true,
        transmission: true,
        color: true,
        category: true,
        modelYear: true,
        announcedPrice: true,
      },
    });
    const uniq = (arr: any[]) => [...new Set(arr.filter(Boolean))].sort();
    const prices = vehicles
      .map((v) => (v.announcedPrice ? Number(v.announcedPrice) : null))
      .filter((p): p is number => p !== null);
    return {
      brands: uniq(vehicles.map((v) => v.brand)),
      models: uniq(vehicles.map((v) => v.model)),
      fuels: uniq(vehicles.map((v) => v.fuel)),
      transmissions: uniq(vehicles.map((v) => v.transmission)),
      colors: uniq(vehicles.map((v) => v.color)),
      categories: uniq(vehicles.map((v) => v.category)),
      years: uniq(vehicles.map((v) => v.modelYear)),
      priceRange: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
      },
    };
  }
}
