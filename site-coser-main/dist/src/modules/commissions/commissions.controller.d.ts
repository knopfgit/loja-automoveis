import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CommissionsService } from './commissions.service';
import { AdjustCommissionDto, CreateCommissionRuleDto, UpdateCommissionRuleDto } from './dto/commission.dto';
export declare class CommissionsController {
    private readonly service;
    constructor(service: CommissionsService);
    createRule(dto: CreateCommissionRuleDto): import(".prisma/client").Prisma.Prisma__CommissionRuleClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listRules(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    updateRule(id: string, dto: UpdateCommissionRuleDto): Promise<{
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
    }>;
    mine(user: AuthUser, pg: PaginationQueryDto, status?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
        } | null;
        sale: {
            id: string;
            finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>>;
    findAll(pg: PaginationQueryDto, sellerId?: string, status?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
        } | null;
        sale: {
            id: string;
            finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>>;
    approve(id: string, user: AuthUser): Promise<{
        seller: {
            user: {
                id: string;
                status: import(".prisma/client").$Enums.UserStatus;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                passwordHash: string;
                failedLoginAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
                roleProfileId: string | null;
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
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    pay(id: string, user: AuthUser): Promise<{
        seller: {
            user: {
                id: string;
                status: import(".prisma/client").$Enums.UserStatus;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                passwordHash: string;
                failedLoginAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
                roleProfileId: string | null;
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
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    cancel(id: string, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    adjust(id: string, dto: AdjustCommissionDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        calcBase: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
}
