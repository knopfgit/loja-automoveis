import { UserRole, UserStatus } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UsersService } from './users.service';
import { RbacService } from './rbac.service';
declare class SetStatusDto {
    status: UserStatus;
}
declare class CreateRoleDto {
    name: string;
    description?: string;
}
declare class SetPermissionsDto {
    permissionIds: string[];
}
declare class CreatePermissionDto {
    code: string;
    description?: string;
}
export declare class UsersController {
    private readonly users;
    private readonly rbac;
    constructor(users: UsersService, rbac: RbacService);
    findAll(pg: PaginationQueryDto, role?: UserRole, status?: UserStatus): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        employee: {
            id: string;
            fullName: string;
        } | null;
        customer: {
            id: string;
            fullName: string;
        } | null;
    }>>;
    setStatus(id: string, dto: SetStatusDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    loginHistory(id: string, pg: PaginationQueryDto): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        id: string;
        createdAt: Date;
        userId: string;
        reason: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        success: boolean;
    }>>;
    assignRoleProfile(id: string, roleProfileId: string | null, user: AuthUser): Promise<{
        id: string;
        roleProfileId: string | null;
    }>;
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
    createRole(dto: CreateRoleDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isSystem: boolean;
    }>;
    setPermissions(id: string, dto: SetPermissionsDto, user: AuthUser): Promise<({
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
    deleteRole(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    listPermissions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
    }[]>;
    createPermission(dto: CreatePermissionDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
    }>;
}
export {};
