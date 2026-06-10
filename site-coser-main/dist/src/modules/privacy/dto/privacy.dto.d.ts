import { ConsentCategory } from '@prisma/client';
export declare class ConsentItemDto {
    category: ConsentCategory;
    granted: boolean;
}
export declare class RegisterConsentDto {
    consents: ConsentItemDto[];
    termsVersion?: string;
    sessionId?: string;
}
export declare class VehicleViewDto {
    vehicleId: string;
    sessionId?: string;
    sourcePage?: string;
}
export declare class LocationTrackingDto {
    latitude: number;
    longitude: number;
    sessionId?: string;
}
export declare class MarketingPreferenceDto {
    emailOptIn?: boolean;
    whatsappOptIn?: boolean;
    interestBrands?: string[];
    interestModels?: string[];
    priceMin?: number;
    priceMax?: number;
    customerId?: string;
}
