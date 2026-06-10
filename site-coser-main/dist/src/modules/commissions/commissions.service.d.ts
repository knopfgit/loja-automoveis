import { Prisma, VehicleSale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { DreService } from '../financial/dre.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AdjustCommissionDto, CreateCommissionRuleDto, UpdateCommissionRuleDto } from './dto/commission.dto';
export declare class CommissionsService {
    private readonly prisma;
    private readonly audit;
    private readonly realtime;
    private readonly dre;
    private readonly notifications;
    constructor(prisma: PrismaService, audit: AuditService, realtime: RealtimeService, dre: DreService, notifications: NotificationsService);
    createRule(dto: CreateCommissionRuleDto): Prisma.Prisma__CommissionRuleClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listRules(): Prisma.PrismaPromise<{
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
    }[]>;
    updateRule(id: string, dto: UpdateCommissionRuleDto): Promise<{
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
    }>;
    private resolveRule;
    private computeAmount;
    generateForSale(sale: VehicleSale, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    approve(id: string, actorId?: string): Promise<{
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
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    pay(id: string, actorId?: string): Promise<{
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
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    cancel(id: string, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    adjust(id: string, dto: AdjustCommissionDto, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>;
    private notifySeller;
    private getOrThrow;
    findAll(pg: PaginationQueryDto, filters: {
        sellerId?: string;
        status?: string;
    }): Promise<PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
        } | null;
        sale: {
            id: string;
            finalPrice: Prisma.Decimal | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>>;
    findMine(sellerId: string, pg: PaginationQueryDto, status?: string): Promise<PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
        } | null;
        sale: {
            id: string;
            finalPrice: Prisma.Decimal | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        calcBase: Prisma.Decimal;
        percentage: Prisma.Decimal | null;
        sellerId: string;
        generatedAt: Date;
        approvedAt: Date | null;
        paidAt: Date | null;
        approvedById: string | null;
        manualAdjustment: boolean;
        saleId: string;
        ruleId: string | null;
    }>>;
}
