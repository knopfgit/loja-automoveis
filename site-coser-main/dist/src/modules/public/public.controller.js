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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const client_info_decorator_1 = require("../../common/decorators/client-info.decorator");
const app_exception_1 = require("../../common/exceptions/app.exception");
const vehicles_service_1 = require("../vehicles/vehicles.service");
const store_service_1 = require("../store/store.service");
const leads_service_1 = require("../leads/leads.service");
const privacy_service_1 = require("../privacy/privacy.service");
const vehicle_extra_dto_1 = require("../vehicles/dto/vehicle-extra.dto");
const lead_dto_1 = require("../leads/dto/lead.dto");
const privacy_dto_1 = require("../privacy/dto/privacy.dto");
let PublicController = class PublicController {
    constructor(vehicles, store, leads, privacy) {
        this.vehicles = vehicles;
        this.store = store;
        this.leads = leads;
        this.privacy = privacy;
    }
    featured() {
        return this.vehicles.findFeatured();
    }
    mostViewed() {
        return this.vehicles.findMostViewed();
    }
    list(query) {
        return this.vehicles.findPublic(query);
    }
    bySlug(slug) {
        return this.vehicles.findPublicBySlug(slug);
    }
    filters() {
        return this.vehicles.publicFilters();
    }
    storeLocation() {
        return this.store.getLocation();
    }
    specialistContact(dto) {
        return this.leads.specialistContact(dto);
    }
    trackView(dto, client) {
        return this.privacy.trackVehicleView(dto, client);
    }
    consents(dto, client) {
        return this.privacy.registerConsent(dto, client);
    }
    marketing(dto) {
        if (!dto.customerId) {
            throw new app_exception_1.AppException('VALIDATION_ERROR', 'customerId é obrigatório neste endpoint público.');
        }
        return this.privacy.setMarketingPreferences(dto.customerId, dto);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('vehicles/featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Veículos em destaque' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "featured", null);
__decorate([
    (0, common_1.Get)('vehicles/most-viewed'),
    (0, swagger_1.ApiOperation)({ summary: 'Veículos mais visualizados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "mostViewed", null);
__decorate([
    (0, common_1.Get)('vehicles'),
    (0, swagger_1.ApiOperation)({ summary: 'Catálogo público de veículos (com filtros)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_extra_dto_1.VehicleQueryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('vehicles/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhe público de um veículo por slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "bySlug", null);
__decorate([
    (0, common_1.Get)('filters'),
    (0, swagger_1.ApiOperation)({ summary: 'Opções de filtro disponíveis no catálogo' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "filters", null);
__decorate([
    (0, common_1.Get)('store/location'),
    (0, swagger_1.ApiOperation)({ summary: 'Localização pública da loja' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "storeLocation", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, common_1.Post)('leads/specialist-contact'),
    (0, swagger_1.ApiOperation)({
        summary: 'Falar com especialista (gera lead + URL do WhatsApp)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lead_dto_1.SpecialistContactDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "specialistContact", null);
__decorate([
    (0, common_1.Post)('tracking/vehicle-view'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar visualização de veículo' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.VehicleViewDto, Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "trackView", null);
__decorate([
    (0, common_1.Post)('consents'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar consentimento de cookies (visitante)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.RegisterConsentDto, Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "consents", null);
__decorate([
    (0, common_1.Put)('marketing/preferences'),
    (0, swagger_1.ApiOperation)({
        summary: 'Atualizar preferências de marketing (requer customerId no corpo para visitante identificado)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "marketing", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Public'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService,
        store_service_1.StoreService,
        leads_service_1.LeadsService,
        privacy_service_1.PrivacyService])
], PublicController);
//# sourceMappingURL=public.controller.js.map