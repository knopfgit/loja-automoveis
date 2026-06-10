"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const string_util_1 = require("../../common/utils/string.util");
const vehicle_specs_service_1 = require("../vehicle-specs/vehicle-specs.service");
const vehicles_serializer_1 = require("./vehicles.serializer");
let VehiclesService = class VehiclesService {
    constructor(prisma, audit, realtime, specsService) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.specsService = specsService;
    }
    async uniqueSlug(base) {
        const root = (0, string_util_1.slugify)(base) || 'veiculo';
        let candidate = root;
        let i = 1;
        while (await this.prisma.vehicle.findUnique({ where: { slug: candidate } })) {
            candidate = `${root}-${i++}`;
        }
        return candidate;
    }
    async create(dto, actorId) {
        const slug = await this.uniqueSlug(`${dto.brand}-${dto.model}-${dto.version ?? ''}-${dto.modelYear}`);
        const vehicle = await this.prisma.vehicle.create({
            data: {
                publicCode: (0, string_util_1.publicCode)(),
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
        this.realtime.emit(events_constants_1.EVENTS.VEHICLE_CREATED, { id: vehicle.id, brand: vehicle.brand, model: vehicle.model }, { roles: ['ADMIN', 'SELLER'] });
        return vehicle;
    }
    async findAll(query) {
        const where = {
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
            featured: query.featured === undefined ? undefined : query.featured === 'true',
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
        const orderBy = query.sortBy
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
        return paginated_result_1.PaginatedResult.of(items, total, query.page, query.limit);
    }
    range(min, max) {
        if (min === undefined && max === undefined)
            return undefined;
        return { gte: min, lte: max };
    }
    decimalRange(min, max) {
        if (min === undefined && max === undefined)
            return undefined;
        return { gte: min, lte: max };
    }
    async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                spec: true,
                media: { orderBy: { position: 'asc' } },
                dre: true,
            },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        return vehicle;
    }
    async update(id, dto, actorId) {
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
        this.realtime.emit(events_constants_1.EVENTS.VEHICLE_UPDATED, { id }, { roles: ['ADMIN', 'SELLER'] });
        return updated;
    }
    async archive(id, reason, actorId) {
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
    async applySpecs(id, dto, actorId) {
        await this.findOne(id);
        const result = await this.specsService.search({
            brand: dto.brand,
            model: dto.model,
            year: dto.year,
            version: dto.version,
        });
        const base = result?.spec ?? {};
        const overrides = dto.manualOverrides ?? {};
        const source = result
            ? client_1.SpecSource.PROVIDER_MOCK
            : client_1.SpecSource.MANUAL;
        const fieldSources = {};
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
        await this.prisma.vehicle.update({
            where: { id },
            data: {
                fuel: this.mapEnum(merged.fuel),
                transmission: this.mapEnum(merged.transmission),
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
    async upsertSpec(id, dto, actorId) {
        await this.findOne(id);
        const fieldSources = {};
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
    pickSpecFields(s) {
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
        const out = {};
        for (const key of allowed)
            if (s[key] !== undefined)
                out[key] = s[key];
        return out;
    }
    mapEnum(value) {
        return value ? value.toUpperCase() : undefined;
    }
    async addMedia(id, dto, actorId) {
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
    async removeMedia(id, mediaId) {
        const media = await this.prisma.vehicleMedia.findFirst({
            where: { id: mediaId, vehicleId: id },
        });
        if (!media)
            throw new app_exception_1.AppException('NOT_FOUND', 'Mídia não encontrada.');
        await this.prisma.vehicleMedia.delete({ where: { id: mediaId } });
        return { success: true };
    }
    async reorderMedia(id, order) {
        await this.prisma.$transaction(order.map((o) => this.prisma.vehicleMedia.updateMany({
            where: { id: o.mediaId, vehicleId: id },
            data: { position: o.position },
        })));
        return { success: true };
    }
    async incrementView(id) {
        await this.prisma.vehicle.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }
    async findPublic(query) {
        const where = {
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
            featured: query.featured === undefined ? undefined : query.featured === 'true',
            modelYear: this.range(query.yearMin, query.yearMax),
            announcedPrice: this.decimalRange(query.priceMin, query.priceMax),
        };
        const orderBy = query.sortBy
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
        return paginated_result_1.PaginatedResult.of(items.map(vehicles_serializer_1.toPublicVehicle), total, query.page, query.limit);
    }
    async findPublicBySlug(slug) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { slug, availableForAd: true },
            include: { spec: true, media: true },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        return (0, vehicles_serializer_1.toPublicVehicle)(vehicle);
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
        return items.map(vehicles_serializer_1.toPublicVehicle);
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
        return items.map(vehicles_serializer_1.toPublicVehicle);
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
        const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
        const prices = vehicles
            .map((v) => (v.announcedPrice ? Number(v.announcedPrice) : null))
            .filter((p) => p !== null);
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
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        vehicle_specs_service_1.VehicleSpecsService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map