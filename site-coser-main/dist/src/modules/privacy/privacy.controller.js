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
exports.PrivacyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_info_decorator_1 = require("../../common/decorators/client-info.decorator");
const app_exception_1 = require("../../common/exceptions/app.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const privacy_service_1 = require("./privacy.service");
const privacy_dto_1 = require("./dto/privacy.dto");
let PrivacyController = class PrivacyController {
    constructor(service) {
        this.service = service;
    }
    registerConsent(dto, client, user) {
        return this.service.registerConsent(dto, client, user?.customerId ?? undefined);
    }
    myConsents(user, sessionId) {
        return this.service.getMyConsents(user.customerId ?? undefined, sessionId);
    }
    updateConsents(dto, client, user) {
        return this.service.registerConsent(dto, client, user.customerId ?? undefined);
    }
    vehicleView(dto, client, user) {
        return this.service.trackVehicleView(dto, client, user?.customerId ?? undefined);
    }
    location(dto, client, user) {
        return this.service.trackLocation(dto, client, user.customerId ?? undefined);
    }
    addFavorite(vehicleId, user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.addFavorite(user.customerId, vehicleId);
    }
    removeFavorite(vehicleId, user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.removeFavorite(user.customerId, vehicleId);
    }
    listFavorites(user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.listFavorites(user.customerId);
    }
    viewHistory(user, pg) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.myViewHistory(user.customerId, pg.page, pg.limit);
    }
    marketing(dto, user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.setMarketingPreferences(user.customerId, dto);
    }
    exportRequest(user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.requestExport(user.customerId);
    }
    deleteRequest(user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.requestDeletion(user.customerId);
    }
};
exports.PrivacyController = PrivacyController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('consents'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar consentimento de cookies (público)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.RegisterConsentDto, Object, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "registerConsent", null);
__decorate([
    (0, common_1.Get)('consents/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Meus consentimentos atuais' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "myConsents", null);
__decorate([
    (0, common_1.Put)('consents/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar meus consentimentos' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.RegisterConsentDto, Object, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "updateConsents", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('tracking/vehicle-view'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar visualização de veículo (público)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.VehicleViewDto, Object, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "vehicleView", null);
__decorate([
    (0, common_1.Post)('tracking/location'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar localização aproximada (requer consentimento)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, client_info_decorator_1.ClientInfoParam)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.LocationTrackingDto, Object, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "location", null);
__decorate([
    (0, common_1.Post)('favorites/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Favoritar veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Delete)('favorites/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover favorito' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Get)('favorites'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus favoritos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "listFavorites", null);
__decorate([
    (0, common_1.Get)('me/view-history'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de veículos visualizados' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "viewHistory", null);
__decorate([
    (0, common_1.Put)('marketing/preferences'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Atualizar preferências de marketing (opt-in/opt-out)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [privacy_dto_1.MarketingPreferenceDto, Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "marketing", null);
__decorate([
    (0, common_1.Post)('privacy/export-request'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar exportação dos meus dados (LGPD)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "exportRequest", null);
__decorate([
    (0, common_1.Post)('privacy/delete-request'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Solicitar exclusão/anonimização dos meus dados (LGPD)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrivacyController.prototype, "deleteRequest", null);
exports.PrivacyController = PrivacyController = __decorate([
    (0, swagger_1.ApiTags)('Privacy / Tracking / Favorites (LGPD)'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [privacy_service_1.PrivacyService])
], PrivacyController);
//# sourceMappingURL=privacy.controller.js.map