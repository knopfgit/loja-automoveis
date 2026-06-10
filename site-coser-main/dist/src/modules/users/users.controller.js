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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const users_service_1 = require("./users.service");
const rbac_service_1 = require("./rbac.service");
class SetStatusDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], SetStatusDto.prototype, "status", void 0);
class CreateRoleDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
class SetPermissionsDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SetPermissionsDto.prototype, "permissionIds", void 0);
class CreatePermissionDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "description", void 0);
let UsersController = class UsersController {
    constructor(users, rbac) {
        this.users = users;
        this.rbac = rbac;
    }
    findAll(pg, role, status) {
        return this.users.findAll(pg, role, status);
    }
    setStatus(id, dto, user) {
        return this.users.setStatus(id, dto.status, user.userId);
    }
    loginHistory(id, pg) {
        return this.users.loginHistory(id, pg);
    }
    assignRoleProfile(id, roleProfileId, user) {
        return this.users.assignRoleProfile(id, roleProfileId, user.userId);
    }
    listRoles() {
        return this.rbac.listRoles();
    }
    createRole(dto, user) {
        return this.rbac.createRole(dto.name, dto.description, user.userId);
    }
    setPermissions(id, dto, user) {
        return this.rbac.setRolePermissions(id, dto.permissionIds, user.userId);
    }
    deleteRole(id, user) {
        return this.rbac.deleteRole(id, user.userId);
    }
    listPermissions() {
        return this.rbac.listPermissions();
    }
    createPermission(dto) {
        return this.rbac.createPermission(dto.code, dto.description);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuários (ADMIN)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Ativar / inativar / bloquear usuário' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetStatusDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Get)('users/:id/login-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de login do usuário' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "loginHistory", null);
__decorate([
    (0, common_1.Patch)('users/:id/role-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Atribuir perfil de permissões ao usuário' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roleProfileId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoleProfile", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar perfis de acesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "listRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar perfil de acesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRoleDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createRole", null);
__decorate([
    (0, common_1.Patch)('roles/:id/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Definir permissões de um perfil' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetPermissionsDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setPermissions", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover perfil de acesso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar permissões' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Post)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar permissão' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePermissionDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createPermission", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users & RBAC'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        rbac_service_1.RbacService])
], UsersController);
//# sourceMappingURL=users.controller.js.map