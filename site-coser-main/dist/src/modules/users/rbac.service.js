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
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
let RbacService = class RbacService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    listRoles() {
        return this.prisma.role.findMany({
            include: { permissions: { include: { permission: true } } },
            orderBy: { name: 'asc' },
        });
    }
    listPermissions() {
        return this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
    }
    async createRole(name, description, actorId) {
        const role = await this.prisma.role.create({ data: { name, description } });
        await this.audit.log({
            actorId,
            action: 'CREATE',
            entity: 'Role',
            entityId: role.id,
            after: { name },
        });
        return role;
    }
    async createPermission(code, description) {
        return this.prisma.permission.create({ data: { code, description } });
    }
    async setRolePermissions(roleId, permissionIds, actorId) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new app_exception_1.AppException('NOT_FOUND', 'Perfil não encontrado.');
        await this.prisma.$transaction([
            this.prisma.rolePermission.deleteMany({ where: { roleId } }),
            this.prisma.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
                skipDuplicates: true,
            }),
        ]);
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'Role',
            entityId: roleId,
            after: { permissionIds },
            reason: 'permissions_updated',
        });
        return this.prisma.role.findUnique({
            where: { id: roleId },
            include: { permissions: { include: { permission: true } } },
        });
    }
    async deleteRole(roleId, actorId) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new app_exception_1.AppException('NOT_FOUND', 'Perfil não encontrado.');
        if (role.isSystem) {
            throw new app_exception_1.AppException('FORBIDDEN', 'Perfil de sistema não pode ser removido.');
        }
        await this.prisma.role.delete({ where: { id: roleId } });
        await this.audit.log({
            actorId,
            action: 'DELETE',
            entity: 'Role',
            entityId: roleId,
        });
        return { success: true };
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RbacService);
//# sourceMappingURL=rbac.service.js.map