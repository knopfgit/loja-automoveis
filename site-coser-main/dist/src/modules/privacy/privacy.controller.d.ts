import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ClientInfo } from '../../common/decorators/client-info.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PrivacyService } from './privacy.service';
import { LocationTrackingDto, MarketingPreferenceDto, RegisterConsentDto, VehicleViewDto } from './dto/privacy.dto';
export declare class PrivacyController {
    private readonly service;
    constructor(service: PrivacyService);
    registerConsent(dto: RegisterConsentDto, client: ClientInfo, user?: AuthUser): Promise<{
        registered: number;
    }>;
    myConsents(user: AuthUser, sessionId?: string): Promise<any[]>;
    updateConsents(dto: RegisterConsentDto, client: ClientInfo, user: AuthUser): Promise<{
        registered: number;
    }>;
    vehicleView(dto: VehicleViewDto, client: ClientInfo, user?: AuthUser): Promise<{
        success: boolean;
    }>;
    location(dto: LocationTrackingDto, client: ClientInfo, user: AuthUser): Promise<{
        success: boolean;
    }>;
    addFavorite(vehicleId: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        vehicleId: string;
        customerId: string;
    }>;
    removeFavorite(vehicleId: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    listFavorites(user: AuthUser): Promise<({
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
    viewHistory(user: AuthUser, pg: PaginationQueryDto): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
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
    marketing(dto: MarketingPreferenceDto, user: AuthUser): Promise<{
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
    exportRequest(user: AuthUser): Promise<{
        requestId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteRequest(user: AuthUser): Promise<{
        requestId: string;
        status: string;
        message: string;
    }>;
}
