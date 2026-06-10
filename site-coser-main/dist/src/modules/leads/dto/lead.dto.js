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
exports.AddInteractionDto = exports.UpdateLeadStatusDto = exports.SpecialistContactDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class SpecialistContactDto {
}
exports.SpecialistContactDto = SpecialistContactDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID do veículo visualizado' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cliente identificado (se logado)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Visitante' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '54999998888' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.LeadOrigin,
        default: client_1.LeadOrigin.SPECIALIST_BUTTON,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LeadOrigin),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "origin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/veiculos/vw-t-cross-2023' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "sourcePage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpecialistContactDto.prototype, "message", void 0);
class UpdateLeadStatusDto {
}
exports.UpdateLeadStatusDto = UpdateLeadStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.LeadStatus }),
    (0, class_validator_1.IsEnum)(client_1.LeadStatus),
    __metadata("design:type", String)
], UpdateLeadStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadStatusDto.prototype, "notes", void 0);
class AddInteractionDto {
}
exports.AddInteractionDto = AddInteractionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'note' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddInteractionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddInteractionDto.prototype, "content", void 0);
//# sourceMappingURL=lead.dto.js.map