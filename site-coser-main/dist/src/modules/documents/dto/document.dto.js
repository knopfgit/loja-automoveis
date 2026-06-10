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
exports.ChecklistStatusQueryDto = exports.ValidateDocumentDto = exports.CreateDocumentDto = exports.UpsertChecklistDto = exports.UpdateDocumentTypeDto = exports.CreateDocumentTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateDocumentTypeDto {
}
exports.CreateDocumentTypeDto = CreateDocumentTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CRLV' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CRLV-e' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DocumentOwnerType }),
    (0, class_validator_1.IsEnum)(client_1.DocumentOwnerType),
    __metadata("design:type", String)
], CreateDocumentTypeDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDocumentTypeDto.prototype, "hasExpiry", void 0);
class UpdateDocumentTypeDto extends (0, swagger_1.PartialType)(CreateDocumentTypeDto) {
}
exports.UpdateDocumentTypeDto = UpdateDocumentTypeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDocumentTypeDto.prototype, "active", void 0);
class UpsertChecklistDto {
}
exports.UpsertChecklistDto = UpsertChecklistDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ChecklistStage }),
    (0, class_validator_1.IsEnum)(client_1.ChecklistStage),
    __metadata("design:type", String)
], UpsertChecklistDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertChecklistDto.prototype, "documentTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertChecklistDto.prototype, "required", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertChecklistDto.prototype, "position", void 0);
class CreateDocumentDto {
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "documentTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DocumentOwnerType }),
    (0, class_validator_1.IsEnum)(client_1.DocumentOwnerType),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "saleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.DocumentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DocumentStatus),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "notes", void 0);
class ValidateDocumentDto {
}
exports.ValidateDocumentDto = ValidateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'REJECTED'] }),
    (0, class_validator_1.IsEnum)(client_1.DocumentStatus),
    __metadata("design:type", String)
], ValidateDocumentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateDocumentDto.prototype, "rejectionReason", void 0);
class ChecklistStatusQueryDto {
}
exports.ChecklistStatusQueryDto = ChecklistStatusQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ChecklistStage }),
    (0, class_validator_1.IsEnum)(client_1.ChecklistStage),
    __metadata("design:type", String)
], ChecklistStatusQueryDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistStatusQueryDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistStatusQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistStatusQueryDto.prototype, "saleId", void 0);
//# sourceMappingURL=document.dto.js.map