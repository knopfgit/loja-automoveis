import { AuthUser } from '../../common/decorators/current-user.decorator';
import { StoreService } from './store.service';
export declare class StoreController {
    private readonly service;
    constructor(service: StoreService);
    location(): Promise<{
        name: string;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        address: {
            street: string | null;
            number: string | null;
            complement: string | null;
            district: string | null;
            zipCode: string | null;
            city: string | null;
            state: string | null;
        };
        coordinates: {
            latitude: number | null;
            longitude: number | null;
        } | null;
        openingHours: import("@prisma/client/runtime/library").JsonValue;
        googleMapsUrl: string | undefined;
        directionsUrl: string | undefined;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
    }>;
    config(): Promise<{
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cnpj: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        street: string | null;
        complement: string | null;
        district: string | null;
        zipCode: string | null;
        city: string | null;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        openingHours: import("@prisma/client/runtime/library").JsonValue | null;
        googleMapsUrl: string | null;
        directionsUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        integrations: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
    upsert(dto: any, user: AuthUser): Promise<{
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cnpj: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        street: string | null;
        complement: string | null;
        district: string | null;
        zipCode: string | null;
        city: string | null;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        openingHours: import("@prisma/client/runtime/library").JsonValue | null;
        googleMapsUrl: string | null;
        directionsUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        integrations: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
}
