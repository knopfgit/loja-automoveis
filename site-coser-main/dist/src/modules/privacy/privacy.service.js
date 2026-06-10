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
exports.PrivacyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
let PrivacyService = class PrivacyService {
    constructor(prisma, audit, realtime) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
    }
    async registerConsent(dto, client, customerId) {
        const created = await this.prisma.$transaction(dto.consents.map((c) => this.prisma.cookieConsent.create({
            data: {
                customerId,
                sessionId: dto.sessionId,
                category: c.category,
                granted: c.granted,
                termsVersion: dto.termsVersion,
                ipHash: client.ipHash,
                userAgent: client.userAgent,
            },
        })));
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
    async getMyConsents(customerId, sessionId) {
        if (!customerId && !sessionId) {
            throw new app_exception_1.AppException('VALIDATION_ERROR', 'customerId ou sessionId requerido.');
        }
        const all = await this.prisma.cookieConsent.findMany({
            where: { customerId, sessionId },
            orderBy: { createdAt: 'desc' },
        });
        const latest = {};
        for (const c of all) {
            if (!latest[c.category])
                latest[c.category] = c;
        }
        return Object.values(latest);
    }
    async trackVehicleView(dto, client, customerId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
            select: { id: true },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
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
        this.realtime.emit(events_constants_1.EVENTS.VEHICLE_VIEWED, { vehicleId: dto.vehicleId }, { roles: ['ADMIN'] });
        return { success: true };
    }
    async trackLocation(dto, client, customerId) {
        const consent = await this.prisma.cookieConsent.findFirst({
            where: {
                category: 'LOCATION',
                granted: true,
                OR: [{ customerId }, { sessionId: dto.sessionId }],
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!consent) {
            throw new app_exception_1.AppException('FORBIDDEN', 'Consentimento de localização não concedido.');
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
    async addFavorite(customerId, vehicleId) {
        const exists = await this.prisma.favorite.findUnique({
            where: { customerId_vehicleId: { customerId, vehicleId } },
        });
        if (exists)
            return exists;
        const [favorite] = await this.prisma.$transaction([
            this.prisma.favorite.create({ data: { customerId, vehicleId } }),
            this.prisma.vehicle.update({
                where: { id: vehicleId },
                data: { favoriteCount: { increment: 1 } },
            }),
        ]);
        return favorite;
    }
    async removeFavorite(customerId, vehicleId) {
        const exists = await this.prisma.favorite.findUnique({
            where: { customerId_vehicleId: { customerId, vehicleId } },
        });
        if (!exists)
            return { success: true };
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
    async listFavorites(customerId) {
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
    async myViewHistory(customerId, page, limit) {
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
        return paginated_result_1.PaginatedResult.of(items, total, page, limit);
    }
    async setMarketingPreferences(customerId, dto) {
        const { customerId: _ignore, ...data } = dto;
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
    async requestExport(customerId) {
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
        if (!customer)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
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
    async requestDeletion(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
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
            message: 'Solicitação registrada. A anonimização será processada pelo job de privacidade.',
        };
    }
};
exports.PrivacyService = PrivacyService;
exports.PrivacyService = PrivacyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService])
], PrivacyService);
//# sourceMappingURL=privacy.service.js.map