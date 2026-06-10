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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const app_exception_1 = require("../../common/exceptions/app.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const commissions_service_1 = require("./commissions.service");
const commission_dto_1 = require("./dto/commission.dto");
let CommissionsController = class CommissionsController {
    constructor(service) {
        this.service = service;
    }
    createRule(dto) {
        return this.service.createRule(dto);
    }
    listRules() {
        return this.service.listRules();
    }
    updateRule(id, dto) {
        return this.service.updateRule(id, dto);
    }
    mine(user, pg, status) {
        if (!user.employeeId)
            throw new app_exception_1.AppException('EMPLOYEE_NOT_FOUND');
        return this.service.findMine(user.employeeId, pg, status);
    }
    findAll(pg, sellerId, status) {
        return this.service.findAll(pg, { sellerId, status });
    }
    approve(id, user) {
        return this.service.approve(id, user.userId);
    }
    pay(id, user) {
        return this.service.pay(id, user.userId);
    }
    cancel(id, user) {
        return this.service.cancel(id, user.userId);
    }
    adjust(id, dto, user) {
        return this.service.adjust(id, dto, user.userId);
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Post)('commission-rules'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar regra de comissão' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commission_dto_1.CreateCommissionRuleDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)('commission-rules'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar regras de comissão' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "listRules", null);
__decorate([
    (0, common_1.Patch)('commission-rules/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar regra de comissão' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commission_dto_1.UpdateCommissionRuleDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Get)('commissions/me'),
    (0, roles_decorator_1.Roles)('SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Minhas comissões (SELLER)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto, String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('commissions'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar comissões (ADMIN)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('sellerId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar comissão' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/pay'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar comissão como paga' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "pay", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/cancel'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar comissão' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/adjust'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajuste manual de comissão (com justificativa)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commission_dto_1.AdjustCommissionDto, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "adjust", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, swagger_1.ApiTags)('Commissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map