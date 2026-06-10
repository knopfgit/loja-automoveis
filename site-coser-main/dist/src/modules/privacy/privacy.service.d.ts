import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { ClientInfo } from '../../common/decorators/client-info.decorator';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { LocationTrackingDto, MarketingPreferenceDto, RegisterConsentDto, VehicleViewDto } from './dto/privacy.dto';
export declare class PrivacyService {
    private readonly prisma;
    private readonly audit;
    private readonly realtime;
    constructor(prisma: PrismaService, audit: AuditService, realtime: RealtimeService);
    registerConsent(dto: RegisterConsentDto, client: ClientInfo, customerId?: string): Promise<{
        registered: number;
    }>;
    getMyConsents(customerId?: string, sessionId?: string): Promise<any[]>;
    trackVehicleView(dto: VehicleViewDto, client: ClientInfo, customerId?: string): Promise<{
        success: boolean;
    }>;
    trackLocation(dto: LocationTrackingDto, client: ClientInfo, customerId?: string): Promise<{
        success: boolean;
    }>;
    addFavorite(customerId: string, vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        vehicleId: string;
        customerId: string;
    }>;
    removeFavorite(customerId: string, vehicleId: string): Promise<{
        success: boolean;
    }>;
    listFavorites(customerId: string): Promise<({
        vehicle: {
            media: {
                id: string;
                createdAt: Date;
                vehicleId: string;
                type: string;
                position: number;
                url: string;
                storageKey: string | null;
                isMain: boolean;
                altText: string | null;
                published: boolean;
                uploadedById: string | null;
            }[];
        } & {
            id: string;
            publicCode: string;
            slug: string;
            plate: string | null;
            renavam: string | null;
            chassis: string | null;
            status: import(".prisma/client").$Enums.VehicleStatus;
            brand: string;
            model: string;
            version: string | null;
            manufactureYear: number;
            modelYear: number;
            engineNumber: string | null;
            category: string | null;
            bodyType: string | null;
            color: string | null;
            fuel: import(".prisma/client").$Enums.FuelType | null;
            transmission: import(".prisma/client").$Enums.Transmission | null;
            doors: number | null;
            mileage: number | null;
            seats: number | null;
            condition: import(".prisma/client").$Enums.VehicleCondition;
            origin: import(".prisma/client").$Enums.VehicleOrigin;
            entryDate: Date;
            archiveReason: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal | null;
            suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
            announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            soldPrice: import("@prisma/client/runtime/library").Decimal | null;
            soldAt: Date | null;
            featured: boolean;
            availableForAd: boolean;
            internalNotes: string | null;
            publicDescription: string | null;
            viewCount: number;
            favoriteCount: number;
            contactCount: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        vehicleId: string;
        customerId: string;
    })[]>;
    myViewHistory(customerId: string, page: number, limit: number): Promise<PaginatedResult<{
        vehicle: {
            slug: string;
            brand: string;
            model: string;
        };
    } & {
        id: string;
        createdAt: Date;
        vehicleId: string;
        customerId: string | null;
        sourcePage: string | null;
        userAgent: string | null;
        ipHash: string | null;
        sessionId: string | null;
    }>>;
    setMarketingPreferences(customerId: string, dto: MarketingPreferenceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        emailOptIn: boolean;
        whatsappOptIn: boolean;
        interestBrands: string[];
        interestModels: string[];
        priceMin: import("@prisma/client/runtime/library").Decimal | null;
        priceMax: import("@prisma/client/runtime/library").Decimal | null;
        customerId: string;
    }>;
    requestExport(customerId: string): Promise<{
        requestId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    requestDeletion(customerId: string): Promise<{
        requestId: string;
        status: string;
        message: string;
    }>;
}
