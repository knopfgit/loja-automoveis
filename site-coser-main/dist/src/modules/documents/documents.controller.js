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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const fs_1 = require("fs");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const documents_service_1 = require("./documents.service");
const document_dto_1 = require("./dto/document.dto");
let DocumentsController = class DocumentsController {
    constructor(service) {
        this.service = service;
    }
    listTypes(ownerType) {
        return this.service.listTypes(ownerType);
    }
    createType(dto) {
        return this.service.createType(dto);
    }
    updateType(id, dto) {
        return this.service.updateType(id, dto);
    }
    listChecklists(stage) {
        return this.service.listChecklists(stage);
    }
    upsertChecklist(dto) {
        return this.service.upsertChecklist(dto);
    }
    removeChecklist(id) {
        return this.service.removeChecklist(id);
    }
    checklistStatus(query) {
        return this.service.checklistStatus(query);
    }
    create(dto, user) {
        return this.service.create(dto, user.userId);
    }
    upload(file, body, user) {
        return this.service.upload(body.documentId, file, body, user.userId);
    }
    validate(id, dto, user) {
        return this.service.validate(id, dto, user.userId);
    }
    findMany(pg, vehicleId, customerId, saleId, status) {
        return this.service.findMany(pg, { vehicleId, customerId, saleId, status });
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    async download(id, user, res) {
        const { path, mimeType, fileName } = await this.service.resolveForDownload(id, user);
        res.locals.rawResponse = true;
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        (0, fs_1.createReadStream)(path).pipe(res);
    }
    uploadMine(file, body, user) {
        return this.service.upload(body.documentId, file, {
            ...body,
            customerId: user.customerId ?? undefined,
            ownerType: 'CUSTOMER',
        }, user.userId);
    }
    myDocuments(user, pg) {
        return this.service.findMany(pg, {
            customerId: user.customerId ?? undefined,
        });
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)('document-types'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tipos de documento' }),
    __param(0, (0, common_1.Query)('ownerType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listTypes", null);
__decorate([
    (0, common_1.Post)('document-types'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar tipo de documento configurável' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.CreateDocumentTypeDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createType", null);
__decorate([
    (0, common_1.Patch)('document-types/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar/ativar/desativar tipo de documento' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.UpdateDocumentTypeDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "updateType", null);
__decorate([
    (0, common_1.Get)('document-checklists'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar checklists configurados por etapa' }),
    __param(0, (0, common_1.Query)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listChecklists", null);
__decorate([
    (0, common_1.Put)('document-checklists'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Configurar item de checklist por etapa' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.UpsertChecklistDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upsertChecklist", null);
__decorate([
    (0, common_1.Delete)('document-checklists/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover item de checklist' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "removeChecklist", null);
__decorate([
    (0, common_1.Get)('document-checklists/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status do checklist (documentos pendentes) por etapa',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.ChecklistStatusQueryDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "checklistStatus", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar/registrar documento (sem arquivo)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('documents/upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar arquivo de documento (cria nova versão)' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('documents/:id/validate'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar ou rejeitar documento' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.ValidateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar documentos (filtros: vehicleId, customerId, saleId, status)',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('customerId')),
    __param(3, (0, common_1.Query)('saleId')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findMany", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar documento' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('documents/:id/download'),
    (0, swagger_1.ApiOperation)({
        summary: 'Baixar arquivo (restrito; cliente só os próprios)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('me/documents/upload'),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente envia documento solicitado' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "uploadMine", null);
__decorate([
    (0, common_1.Get)('me/documents'),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente consulta seus documentos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "myDocuments", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map