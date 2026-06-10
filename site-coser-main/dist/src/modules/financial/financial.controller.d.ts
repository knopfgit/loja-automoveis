import { FinancialNature } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { FinancialService } from './financial.service';
import { DreService } from './dre.service';
declare class CreateFinancialEntryDto {
    vehicleId?: string;
    nature: FinancialNature;
    category: string;
    amount: number;
    description?: string;
    date?: string;
    notes?: string;
    documentId?: string;
}
export declare class FinancialController {
    private readonly financial;
    private readonly dre;
    constructor(financial: FinancialService, dre: DreService);
    create(dto: CreateFinancialEntryDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialStatus;
        category: string;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        nature: import(".prisma/client").$Enums.FinancialNature;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        sourceModule: string | null;
        externalRef: string | null;
        documentId: string | null;
        responsibleId: string | null;
        notes: string | null;
    }>;
    list(vehicleId: string, page?: string, limit?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialStatus;
        category: string;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        nature: import(".prisma/client").$Enums.FinancialNature;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        sourceModule: string | null;
        externalRef: string | null;
        documentId: string | null;
        responsibleId: string | null;
        notes: string | null;
    }>>;
    remove(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    consolidated(from?: string, to?: string): Promise<{
        totals: {
            totalRevenue: number;
            totalExpenses: number;
            grossProfit: number;
            commissionTotal: number;
            netProfit: number;
            vehicles: number;
        };
        byBrand: Record<string, number>;
        byStatus: Record<string, number>;
        categoryTotals: Record<string, number>;
        mostProfitable: {
            vehicle: string;
            netProfit: number;
        }[];
        longestInStock: {
            vehicle: string;
            daysInStock: number;
        }[];
        highestCost: {
            vehicle: string;
            totalInvested: number;
        }[];
    }>;
    byVehicle(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        totalInvested: import("@prisma/client/runtime/library").Decimal;
        totalExpenses: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        grossProfit: import("@prisma/client/runtime/library").Decimal;
        commissionTotal: import("@prisma/client/runtime/library").Decimal;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        profitMargin: number;
        daysInStock: number;
        costPerDay: import("@prisma/client/runtime/library").Decimal;
        discountGiven: import("@prisma/client/runtime/library").Decimal;
        categoryBreakdown: import("@prisma/client/runtime/library").JsonValue | null;
        lastCalculatedAt: Date;
    }>;
    detailed(vehicleId: string): Promise<{
        summary: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string;
            totalInvested: import("@prisma/client/runtime/library").Decimal;
            totalExpenses: import("@prisma/client/runtime/library").Decimal;
            totalRevenue: import("@prisma/client/runtime/library").Decimal;
            grossProfit: import("@prisma/client/runtime/library").Decimal;
            commissionTotal: import("@prisma/client/runtime/library").Decimal;
            netProfit: import("@prisma/client/runtime/library").Decimal;
            profitMargin: number;
            daysInStock: number;
            costPerDay: import("@prisma/client/runtime/library").Decimal;
            discountGiven: import("@prisma/client/runtime/library").Decimal;
            categoryBreakdown: import("@prisma/client/runtime/library").JsonValue | null;
            lastCalculatedAt: Date;
        };
        entries: {
            id: string;
            status: import(".prisma/client").$Enums.FinancialStatus;
            category: string;
            origin: import(".prisma/client").$Enums.FinancialOrigin;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string | null;
            nature: import(".prisma/client").$Enums.FinancialNature;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            sourceModule: string | null;
            externalRef: string | null;
            documentId: string | null;
            responsibleId: string | null;
            notes: string | null;
        }[];
    }>;
    recalc(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        totalInvested: import("@prisma/client/runtime/library").Decimal;
        totalExpenses: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        grossProfit: import("@prisma/client/runtime/library").Decimal;
        commissionTotal: import("@prisma/client/runtime/library").Decimal;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        profitMargin: number;
        daysInStock: number;
        costPerDay: import("@prisma/client/runtime/library").Decimal;
        discountGiven: import("@prisma/client/runtime/library").Decimal;
        categoryBreakdown: import("@prisma/client/runtime/library").JsonValue | null;
        lastCalculatedAt: Date;
    }>;
}
export {};
