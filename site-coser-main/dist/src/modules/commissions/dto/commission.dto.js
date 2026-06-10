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
exports.AdjustCommissionDto = exports.UpdateCommissionRuleDto = exports.CreateCommissionRuleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateCommissionRuleDto {
}
exports.CreateCommissionRuleDto = CreateCommissionRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Comissão padrão 3%' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CommissionRuleType }),
    (0, class_validator_1.IsEnum)(client_1.CommissionRuleType),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 3.5,
        description: 'Percentual (ex.: 3.5 = 3,5%)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCommissionRuleDto.prototype, "fixedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Faixas progressivas [{ min, max, percentage }]',
        type: 'array',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCommissionRuleDto.prototype, "tiers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCommissionRuleDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRuleDto.prototype, "description", void 0);
class UpdateCommissionRuleDto extends (0, swagger_1.PartialType)(CreateCommissionRuleDto) {
}
exports.UpdateCommissionRuleDto = UpdateCommissionRuleDto;
class AdjustCommissionDto {
}
exports.AdjustCommissionDto = AdjustCommissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1200.0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdjustCommissionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Justificativa obrigatória do ajuste manual' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustCommissionDto.prototype, "reason", void 0);
//# sourceMappingURL=commission.dto.js.map