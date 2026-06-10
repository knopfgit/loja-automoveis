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
exports.MaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const maintenance_service_1 = require("./maintenance.service");
const maintenance_dto_1 = require("./dto/maintenance.dto");
let MaintenanceController = class MaintenanceController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.userId);
    }
    findAll(pg, vehicleId, status) {
        return this.service.findAll(pg, vehicleId, status);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user.userId);
    }
    addPart(id, dto, user) {
        return this.service.addPart(id, dto, user.userId);
    }
    removePart(id, maintenancePartId, user) {
        return this.service.removePart(id, maintenancePartId, user.userId);
    }
    complete(id, dto, user) {
        return this.service.complete(id, dto, user.userId);
    }
    cancel(id, user) {
        return this.service.cancel(id, user.userId);
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Abrir manutenção/revisão' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_dto_1.CreateMaintenanceDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar manutenções' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar manutenção' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar manutenção' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_dto_1.UpdateMaintenanceDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/parts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Aplicar peça à manutenção (baixa de estoque + DRE)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_dto_1.AddMaintenancePartDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "addPart", null);
__decorate([
    (0, common_1.Delete)(':id/parts/:maintenancePartId'),
    (0, swagger_1.ApiOperation)({ summary: 'Estornar peça aplicada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('maintenancePartId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "removePart", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Finalizar manutenção (gera lançamentos e prazos)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_dto_1.CompleteMaintenanceDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar manutenção (estorna peças)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "cancel", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, swagger_1.ApiTags)('Maintenance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('maintenances'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    __metadata("design:paramtypes", [maintenance_service_1.MaintenanceService])
], MaintenanceController);
//# sourceMappingURL=maintenance.controller.js.map