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
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
let StoreService = class StoreService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getConfig() {
        const store = await this.prisma.store.findFirst();
        if (!store)
            throw new app_exception_1.AppException('STORE_NOT_CONFIGURED');
        return store;
    }
    async upsert(dto, actorId) {
        const existing = await this.prisma.store.findFirst();
        const data = {
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
    async getLocation() {
        const store = await this.prisma.store.findFirst();
        if (!store)
            throw new app_exception_1.AppException('STORE_NOT_CONFIGURED');
        const hasCoords = store.latitude != null && store.longitude != null;
        const directionsUrl = store.directionsUrl ||
            (hasCoords
                ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
                : undefined);
        const googleMapsUrl = store.googleMapsUrl ||
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
};
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], StoreService);
//# sourceMappingURL=store.service.js.map