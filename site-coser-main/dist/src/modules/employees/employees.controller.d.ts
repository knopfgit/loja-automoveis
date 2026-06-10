import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
export declare class EmployeesController {
    private readonly service;
    constructor(service: EmployeesService);
    create(dto: CreateEmployeeDto, user: AuthUser): Promise<{
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
    findAll(pg: PaginationQueryDto, active?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
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
            percentage: import("@prisma/client/runtime/library").Decimal | null;
            type: import(".prisma/client").$Enums.CommissionRuleType;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            tiers: import("@prisma/client/runtime/library").JsonValue | null;
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
    update(id: string, dto: UpdateEmployeeDto, user: AuthUser): Promise<{
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
    deactivate(id: string, user: AuthUser): Promise<{
        id: string;
        active: boolean;
    }>;
}
