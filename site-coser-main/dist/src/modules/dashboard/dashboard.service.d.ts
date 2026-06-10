import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    private startOfMonth;
    adminDashboard(): Promise<{
        vehicles: {
            available: number;
            inMaintenance: number;
            reserved: number;
            sold: number;
        };
        finance: {
            revenueMonth: number;
            revenueTotal: number;
            totalExpenses: number;
            grossProfit: number;
            netProfit: number;
            avgMargin: number;
            commissionsPending: number;
            commissionsPaid: number;
        };
        alerts: {
            lowStockParts: number;
            pendingDocuments: number;
            expiringDocuments: number;
        };
        sales: {
            thisMonth: number;
            bySeller: {
                sellerId: string;
                sellerName: string;
                count: number;
                total: number;
            }[];
        };
        leads: {
            pending: number;
            total: number;
            converted: number;
            conversionRate: number;
        };
        longestInStock: {
            vehicle: string;
            daysInStock: number;
            status: import(".prisma/client").$Enums.VehicleStatus;
        }[];
        generatedAt: string;
    }>;
    private computeAdmin;
    sellerDashboard(employeeId: string): Promise<{
        leads: {
            total: number;
            pendingContacts: number;
            negotiations: number;
        };
        sales: {
            thisMonth: number;
        };
        commissions: {
            count: number;
            total: number;
            byStatus: {
                status: import(".prisma/client").$Enums.CommissionStatus;
                total: number;
            }[];
        };
        reservationsExpiring: number;
        generatedAt: string;
    }>;
}
