import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
export declare class RbacService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    listRoles(): import(".prisma/client").Prisma.PrismaPromise<({
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                description: string | null;
                code: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isSystem: boolean;
    })[]>;
    listPermissions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
    }[]>;
    createRole(name: string, description?: string, actorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isSystem: boolean;
    }>;
    createPermission(code: string, description?: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
    }>;
    setRolePermissions(roleId: string, permissionIds: string[], actorId?: string): Promise<({
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                description: string | null;
                code: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isSystem: boolean;
    }) | null>;
    deleteRole(roleId: string, actorId?: string): Promise<{
        success: boolean;
    }>;
}
