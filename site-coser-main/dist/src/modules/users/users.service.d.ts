import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(pg: PaginationQueryDto, role?: UserRole, status?: UserStatus): Promise<PaginatedResult<{
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
    setStatus(id: string, status: UserStatus, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    assignRoleProfile(id: string, roleProfileId: string | null, actorId?: string): Promise<{
        id: string;
        roleProfileId: string | null;
    }>;
    loginHistory(id: string, pg: PaginationQueryDto): Promise<PaginatedResult<{
        id: string;
        createdAt: Date;
        userId: string;
        reason: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        success: boolean;
    }>>;
}
