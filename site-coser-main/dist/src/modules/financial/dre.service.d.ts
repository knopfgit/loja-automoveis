import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recalculate(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        totalInvested: Prisma.Decimal;
        totalExpenses: Prisma.Decimal;
        totalRevenue: Prisma.Decimal;
        grossProfit: Prisma.Decimal;
        commissionTotal: Prisma.Decimal;
        netProfit: Prisma.Decimal;
        profitMargin: number;
        daysInStock: number;
        costPerDay: Prisma.Decimal;
        discountGiven: Prisma.Decimal;
        categoryBreakdown: Prisma.JsonValue | null;
        lastCalculatedAt: Date;
    }>;
    getByVehicle(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        totalInvested: Prisma.Decimal;
        totalExpenses: Prisma.Decimal;
        totalRevenue: Prisma.Decimal;
        grossProfit: Prisma.Decimal;
        commissionTotal: Prisma.Decimal;
        netProfit: Prisma.Decimal;
        profitMargin: number;
        daysInStock: number;
        costPerDay: Prisma.Decimal;
        discountGiven: Prisma.Decimal;
        categoryBreakdown: Prisma.JsonValue | null;
        lastCalculatedAt: Date;
    }>;
    getDetailed(vehicleId: string): Promise<{
        summary: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string;
            totalInvested: Prisma.Decimal;
            totalExpenses: Prisma.Decimal;
            totalRevenue: Prisma.Decimal;
            grossProfit: Prisma.Decimal;
            commissionTotal: Prisma.Decimal;
            netProfit: Prisma.Decimal;
            profitMargin: number;
            daysInStock: number;
            costPerDay: Prisma.Decimal;
            discountGiven: Prisma.Decimal;
            categoryBreakdown: Prisma.JsonValue | null;
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
            amount: Prisma.Decimal;
            date: Date;
            sourceModule: string | null;
            externalRef: string | null;
            documentId: string | null;
            responsibleId: string | null;
            notes: string | null;
        }[];
    }>;
    consolidated(params: {
        from?: Date;
        to?: Date;
    }): Promise<{
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
}
