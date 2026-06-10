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
exports.SalesController = exports.ReservationsController = exports.AcquisitionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const acquisitions_service_1 = require("./acquisitions.service");
const reservations_service_1 = require("./reservations.service");
const sales_service_1 = require("./sales.service");
const commercial_dto_1 = require("./dto/commercial.dto");
let AcquisitionsController = class AcquisitionsController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.userId);
    }
    findAll(pg) {
        return this.service.findAll(pg);
    }
    findOne(vehicleId) {
        return this.service.findOne(vehicleId);
    }
};
exports.AcquisitionsController = AcquisitionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar compra de veículo (aquisição)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commercial_dto_1.CreateAcquisitionDto, Object]),
    __metadata("design:returntype", void 0)
], AcquisitionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar aquisições' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AcquisitionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':vehicleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Aquisição de um veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcquisitionsController.prototype, "findOne", null);
exports.AcquisitionsController = AcquisitionsController = __decorate([
    (0, swagger_1.ApiTags)('Commercial - Acquisitions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('acquisitions'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [acquisitions_service_1.AcquisitionsService])
], AcquisitionsController);
let ReservationsController = class ReservationsController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.userId);
    }
    findAll(user, pg, status) {
        const sellerId = user.role === 'SELLER' ? (user.employeeId ?? undefined) : undefined;
        return this.service.findAll(pg, { status, sellerId });
    }
    cancel(id, dto, user) {
        return this.service.cancel(id, dto.reason, user.userId);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar reserva' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commercial_dto_1.CreateReservationDto, Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar reservas' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar reserva' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commercial_dto_1.CancelReservationDto, Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "cancel", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, swagger_1.ApiTags)('Commercial - Reservations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reservations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
let SalesController = class SalesController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.employeeId ?? undefined, user.userId);
    }
    findAll(user, pg, status, sellerId, from, to) {
        const effectiveSeller = user.role === 'SELLER' ? (user.employeeId ?? undefined) : sellerId;
        return this.service.findAll(pg, {
            sellerId: effectiveSeller,
            status,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }
    findOne(id, user) {
        return this.service.findOne(id, user);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user.userId);
    }
    updateStatus(id, dto, user) {
        return this.service.updateStatus(id, dto, user.userId);
    }
    deliver(id, user) {
        return this.service.markDelivered(id, user.userId);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar venda/negociação' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commercial_dto_1.CreateSaleDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar vendas (vendedor vê apenas as próprias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('sellerId')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar venda' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar dados da venda/negociação' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commercial_dto_1.UpdateSaleDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar etapa da venda (inclui COMPLETED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commercial_dto_1.UpdateSaleStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/deliver'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar entrega do veículo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deliver", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('Commercial - Sales'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sales'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=commercial.controller.js.map