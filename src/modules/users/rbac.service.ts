import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';

/**
 * Configurable role/permission management. The primary access control uses the
 * UserRole enum (ADMIN/SELLER/CUSTOMER) via guards; this layer lets an admin
 * define granular permission profiles for finer-grained control over time.
 */
@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
  }

  async createRole(name: string, description?: string, actorId?: string) {
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

  async createPermission(code: string, description?: string) {
    return this.prisma.permission.create({ data: { code, description } });
  }

  async setRolePermissions(
    roleId: string,
    permissionIds: string[],
    actorId?: string,
  ) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppException('NOT_FOUND', 'Perfil não encontrado.');

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

  async deleteRole(roleId: string, actorId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppException('NOT_FOUND', 'Perfil não encontrado.');
    if (role.isSystem) {
      throw new AppException(
        'FORBIDDEN',
        'Perfil de sistema não pode ser removido.',
      );
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
}
