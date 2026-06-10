import { AuthUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly service;
    constructor(service: DashboardService);
    admin(): Promise<{
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
    seller(user: AuthUser): Promise<{
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
