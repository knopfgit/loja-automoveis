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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const app_exception_1 = require("../../common/exceptions/app.exception");
const storage_service_1 = require("../../storage/storage.service");
const vehicles_service_1 = require("./vehicles.service");
const stock_service_1 = require("./stock.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const vehicle_extra_dto_1 = require("./dto/vehicle-extra.dto");
let VehiclesController = class VehiclesController {
    constructor(vehicles, stock, storage) {
        this.vehicles = vehicles;
        this.stock = stock;
        this.storage = storage;
    }
    create(dto, user) {
        return this.vehicles.create(dto, user.userId);
    }
    findAll(query) {
        return this.vehicles.findAll(query);
    }
    findOne(id) {
        return this.vehicles.findOne(id);
    }
    update(id, dto, user) {
        return this.vehicles.update(id, dto, user.userId);
    }
    archive(id, dto, user) {
        return this.vehicles.archive(id, dto.reason, user.userId);
    }
    changeStatus(id, dto, user) {
        return this.stock.changeStatus(id, dto.status, { reason: dto.reason, notes: dto.notes }, user.userId);
    }
    movements(id, page = '1', limit = '20') {
        return this.stock.listMovements(id, Number(page), Number(limit));
    }
    applySpecs(id, dto, user) {
        return this.vehicles.applySpecs(id, dto, user.userId);
    }
    upsertSpec(id, dto, user) {
        return this.vehicles.upsertSpec(id, dto, user.userId);
    }
    addMedia(id, dto, user) {
        return this.vehicles.addMedia(id, dto, user.userId);
    }
    async uploadMedia(id, file, user) {
        if (!file)
            throw new app_exception_1.AppException('VALIDATION_ERROR', 'Arquivo ausente.');
        const stored = await this.storage.save(file, 'vehicles');
        return this.vehicles.addMedia(id, { url: stored.url, type: 'image', altText: file.originalname }, user.userId);
    }
    reorder(id, body) {
        return this.vehicles.reorderMedia(id, body.order);
    }
    removeMedia(id, mediaId) {
        return this.vehicles.removeMedia(id, mediaId);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar veículo' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar veículos (visão interna)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_extra_dto_1.VehicleQueryDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar veículo (visão interna)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar veículo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.UpdateVehicleDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Arquivar veículo (ADMIN)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.ArchiveVehicleDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Alterar status / movimentar estoque' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.ChangeStatusDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id/stock-movements'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de movimentações de estoque' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "movements", null);
__decorate([
    (0, common_1.Post)(':id/apply-specs'),
    (0, swagger_1.ApiOperation)({
        summary: 'Preencher ficha técnica automaticamente (com fallback manual)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.ApplySpecsDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "applySpecs", null);
__decorate([
    (0, common_1.Put)(':id/spec'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar ficha técnica manualmente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.UpsertSpecDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "upsertSpec", null);
__decorate([
    (0, common_1.Post)(':id/media'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar mídia por URL' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_extra_dto_1.MediaItemDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "addMedia", null);
__decorate([
    (0, common_1.Post)(':id/media/upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload de imagem do veículo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Patch)(':id/media/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reordenar mídias' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':id/media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover mídia' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('mediaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "removeMedia", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vehicles'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService,
        stock_service_1.StockService,
        storage_service_1.StorageService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map