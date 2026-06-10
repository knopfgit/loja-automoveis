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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const app_exception_1 = require("../../common/exceptions/app.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const customers_service_1 = require("./customers.service");
const customer_dto_1 = require("./dto/customer.dto");
let CustomersController = class CustomersController {
    constructor(service) {
        this.service = service;
    }
    getMe(user) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.getMe(user.customerId);
    }
    updateMe(user, dto) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.updateMe(user.customerId, dto);
    }
    addMyAddress(user, dto) {
        if (!user.customerId)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return this.service.addAddress(user.customerId, dto);
    }
    create(dto, user) {
        return this.service.create(dto, user.userId);
    }
    findAll(pg, search) {
        return this.service.findAll(pg, search);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user.userId);
    }
    addAddress(id, dto) {
        return this.service.addAddress(id, dto);
    }
    updateAddress(id, addressId, dto) {
        return this.service.updateAddress(id, addressId, dto);
    }
    removeAddress(id, addressId) {
        return this.service.removeAddress(id, addressId);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar meus dados (CUSTOMER)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar meus dados (CUSTOMER)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, customer_dto_1.UpdateMyProfileDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/addresses'),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar endereço (CUSTOMER)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, customer_dto_1.AddressDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "addMyAddress", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar cliente (ADMIN/SELLER)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes (ADMIN/SELLER)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhar cliente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cliente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/addresses'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar endereço ao cliente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.AddressDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Patch)(':id/addresses/:addressId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar endereço do cliente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, customer_dto_1.AddressDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id/addresses/:addressId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover endereço do cliente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "removeAddress", null);
exports.CustomersController = CustomersController = __decorate([
    (0, swagger_1.ApiTags)('Customers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map