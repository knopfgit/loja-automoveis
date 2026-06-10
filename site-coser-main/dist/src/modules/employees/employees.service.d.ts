import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
export declare class EmployeesService {
    private readonly prisma;
    private readonly config;
    private readonly audit;
    constructor(prisma: PrismaService, config: ConfigService, audit: AuditService);
    create(dto: CreateEmployeeDto, actorId?: string): Promise<{
        employee: {
            id: string;
            internalNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            whatsapp: string | null;
            email: string;
            active: boolean;
            fullName: string;
            cpf: string;
            position: string | null;
            admissionDate: Date | null;
            pixKey: string | null;
            defaultCommissionRuleId: string | null;
            userId: string;
        } | null;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
        lastLoginAt: Date | null;
        roleProfileId: string | null;
    }>;
    findAll(pg: PaginationQueryDto, active?: boolean): Promise<PaginatedResult<{
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        internalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        email: string;
        active: boolean;
        fullName: string;
        cpf: string;
        position: string | null;
        admissionDate: Date | null;
        pixKey: string | null;
        defaultCommissionRuleId: string | null;
        userId: string;
    }>>;
    findOne(id: string): Promise<{
        defaultCommissionRule: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            percentage: Prisma.Decimal | null;
            type: import(".prisma/client").$Enums.CommissionRuleType;
            fixedAmount: Prisma.Decimal | null;
            tiers: Prisma.JsonValue | null;
            isDefault: boolean;
            active: boolean;
        } | null;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        internalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        email: string;
        active: boolean;
        fullName: string;
        cpf: string;
        position: string | null;
        admissionDate: Date | null;
        pixKey: string | null;
        defaultCommissionRuleId: string | null;
        userId: string;
    }>;
    update(id: string, dto: UpdateEmployeeDto, actorId?: string): Promise<{
        id: string;
        internalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        email: string;
        active: boolean;
        fullName: string;
        cpf: string;
        position: string | null;
        admissionDate: Date | null;
        pixKey: string | null;
        defaultCommissionRuleId: string | null;
        userId: string;
    }>;
    deactivate(id: string, actorId?: string): Promise<{
        id: string;
        active: boolean;
    }>;
}
