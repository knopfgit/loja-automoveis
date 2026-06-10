import { PrismaService } from '../../prisma/prisma.service';
import { DreService } from '../financial/dre.service';
export declare class ReportsService {
    private readonly prisma;
    private readonly dre;
    constructor(prisma: PrismaService, dre: DreService);
    vehiclesStock(): Promise<{
        publicCode: string;
        brand: string;
        model: string;
        modelYear: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        announcedPrice: number;
        entryDate: Date;
    }[]>;
    vehiclesSold(): Promise<{
        publicCode: string;
        brand: string;
        model: string;
        modelYear: number;
        soldPrice: number;
        soldAt: Date | null;
    }[]>;
    vehiclesAvailable(): Promise<{
        publicCode: string;
        brand: string;
        model: string;
        modelYear: number;
        announcedPrice: number;
    }[]>;
    vehiclesStale(days?: number): Promise<{
        publicCode: string;
        brand: string;
        model: string;
        daysInStock: number | null;
        entryDate: Date;
        announcedPrice: number;
    }[]>;
    dreConsolidated(from?: Date, to?: Date): Promise<Record<string, any>[]>;
    dreByVehicle(vehicleId: string): Promise<{
        date: Date;
        nature: import(".prisma/client").$Enums.FinancialNature;
        category: string;
        description: string | null;
        amount: number;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
    }[]>;
    salesByPeriod(from?: Date, to?: Date): Promise<{
        saleDate: Date | null;
        vehicle: string;
        seller: string;
        customer: string;
        finalPrice: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    }[]>;
    salesBySeller(): Promise<{
        seller: string;
        sales: number;
        total: number;
    }[]>;
    commissions(): Promise<{
        seller: string;
        vehicle: string;
        amount: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        generatedAt: Date;
        paidAt: Date | null;
    }[]>;
    documentsPending(): Promise<{
        type: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        vehicle: string;
        createdAt: Date;
    }[]>;
    documentsExpiring(days?: number): Promise<{
        type: string;
        expiryDate: Date | null;
        status: import(".prisma/client").$Enums.DocumentStatus;
    }[]>;
    maintenances(): Promise<{
        vehicle: string;
        type: import(".prisma/client").$Enums.MaintenanceType;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        totalCost: number;
        openedAt: Date;
        completedAt: Date | null;
    }[]>;
    futureRevisions(): Promise<{
        vehicle: string;
        nextRevisionDate: Date | null;
        nextRevisionMileage: number | null;
    }[]>;
    partsStock(): Promise<{
        internalCode: string;
        name: string;
        quantity: number;
        minQuantity: number;
        costPrice: number;
        averagePrice: number;
    }[]>;
    partsLowStock(): Promise<{
        internalCode: string;
        name: string;
        quantity: number;
        minQuantity: number;
    }[]>;
    leads(): Promise<{
        name: string | null;
        phone: string | null;
        vehicle: string;
        seller: string;
        status: import(".prisma/client").$Enums.LeadStatus;
        createdAt: Date;
    }[]>;
    conversions(): Promise<{
        name: string | null;
        seller: string;
        convertedAt: Date | null;
    }[]>;
    marketingInterested(): Promise<{
        name: string;
        email: string | null;
        interestBrands: string[];
        interestModels: string[];
    }[]>;
}
