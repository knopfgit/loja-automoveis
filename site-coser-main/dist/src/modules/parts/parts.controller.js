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
exports.PartsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const parts_service_1 = require("./parts.service");
const suppliers_service_1 = require("./suppliers.service");
const part_dto_1 = require("./dto/part.dto");
let PartsController = class PartsController {
    constructor(parts, suppliers) {
        this.parts = parts;
        this.suppliers = suppliers;
    }
    create(dto, user) {
        return this.parts.create(dto, user.userId);
    }
    findAll(pg, search, lowStock) {
        return this.parts.findAll(pg, search, lowStock === 'true');
    }
    findOne(id) {
        return this.parts.findOne(id);
    }
    update(id, dto, user) {
        return this.parts.update(id, dto, user.userId);
    }
    move(id, dto, user) {
        return this.parts.move(id, dto, user.userId);
    }
    movements(id, page = '1', limit = '20') {
        return this.parts.listMovements(id, Number(page), Number(limit));
    }
    createSupplier(dto) {
        return this.suppliers.create(dto);
    }
    listSuppliers(pg) {
        return this.suppliers.findAll(pg);
    }
    updateSupplier(id, dto) {
        return this.suppliers.update(id, dto);
    }
    removeSupplier(id) {
        return this.suppliers.remove(id);
    }
};
exports.PartsController = PartsController;
__decorate([
    (0, common_1.Post)('parts'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar peça' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [part_dto_1.CreatePartDto, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('parts'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar peças (filtro lowStock=true disponível)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('lowStock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('parts/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar peça' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('parts/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar peça' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, part_dto_1.UpdatePartDto, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('parts/:id/movements'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Movimentar estoque (ENTRY, EXIT, ADJUSTMENT, RESERVE, LOSS, RETURN...)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, part_dto_1.PartMovementDto, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "move", null);
__decorate([
    (0, common_1.Get)('parts/:id/movements'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de movimentações da peça' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "movements", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar fornecedor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [part_dto_1.CreateSupplierDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar fornecedores' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "listSuppliers", null);
__decorate([
    (0, common_1.Patch)('suppliers/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar fornecedor' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, part_dto_1.UpdateSupplierDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar fornecedor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "removeSupplier", null);
exports.PartsController = PartsController = __decorate([
    (0, swagger_1.ApiTags)('Parts & Suppliers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [parts_service_1.PartsService,
        suppliers_service_1.SuppliersService])
], PartsController);
//# sourceMappingURL=parts.controller.js.map