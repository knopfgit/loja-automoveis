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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const financial_service_1 = require("./financial.service");
const dre_service_1 = require("./dre.service");
class CreateFinancialEntryDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.FinancialNature),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "nature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFinancialEntryDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialEntryDto.prototype, "documentId", void 0);
let FinancialController = class FinancialController {
    constructor(financial, dre) {
        this.financial = financial;
        this.dre = dre;
    }
    create(dto, user) {
        return this.financial.createManual(dto, user.userId);
    }
    list(vehicleId, page = '1', limit = '20') {
        return this.financial.listByVehicle(vehicleId, Number(page), Number(limit));
    }
    remove(id, user) {
        return this.financial.remove(id, user.userId);
    }
    consolidated(from, to) {
        return this.dre.consolidated({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }
    byVehicle(vehicleId) {
        return this.dre.getByVehicle(vehicleId);
    }
    detailed(vehicleId) {
        return this.dre.getDetailed(vehicleId);
    }
    recalc(vehicleId) {
        return this.dre.recalculate(vehicleId);
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Post)('financial-entries'),
    (0, swagger_1.ApiOperation)({ summary: 'Lançar receita/despesa manual' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateFinancialEntryDto, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('financial-entries'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar lançamentos de um veículo' }),
    __param(0, (0, common_1.Query)('vehicleId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)('financial-entries/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover lançamento financeiro' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('dre/consolidated'),
    (0, swagger_1.ApiOperation)({ summary: 'DRE consolidada da loja (com filtros de período)' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "consolidated", null);
__decorate([
    (0, common_1.Get)('dre/vehicle/:vehicleId'),
    (0, swagger_1.ApiOperation)({ summary: 'DRE de um veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "byVehicle", null);
__decorate([
    (0, common_1.Get)('dre/vehicle/:vehicleId/detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'DRE detalhada (com lançamentos) de um veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "detailed", null);
__decorate([
    (0, common_1.Post)('dre/vehicle/:vehicleId/recalculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Recalcular DRE do veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "recalc", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financial & DRE'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [financial_service_1.FinancialService,
        dre_service_1.DreService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map