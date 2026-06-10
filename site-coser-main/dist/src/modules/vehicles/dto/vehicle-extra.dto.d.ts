import { FuelType, Transmission, VehicleStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { CreateVehicleDto } from './create-vehicle.dto';
declare const UpdateVehicleDto_base: import("@nestjs/common").Type<Partial<CreateVehicleDto>>;
export declare class UpdateVehicleDto extends UpdateVehicleDto_base {
}
export declare class ChangeStatusDto {
    status: VehicleStatus;
    reason?: string;
    notes?: string;
}
export declare class ArchiveVehicleDto {
    reason?: string;
}
export declare class ApplySpecsDto {
    brand: string;
    model: string;
    year: number;
    version?: string;
    manualOverrides?: Record<string, any>;
}
export declare class UpsertSpecDto {
    engine?: string;
    power?: string;
    torque?: string;
    displacement?: string;
    traction?: string;
    steering?: string;
    suspension?: string;
    urbanConsumption?: string;
    roadConsumption?: string;
    tankCapacity?: string;
    trunkCapacity?: string;
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    weight?: string;
    airbags?: string;
    brakes?: string;
    safetyItems?: string[];
    comfortItems?: string[];
    multimedia?: string[];
    options?: string[];
    technicalNotes?: string;
}
export declare class MediaItemDto {
    url: string;
    type?: string;
    isMain?: boolean;
    position?: number;
    altText?: string;
}
export declare class VehicleQueryDto extends PaginationQueryDto {
    brand?: string;
    model?: string;
    status?: VehicleStatus;
    search?: string;
    yearMin?: number;
    yearMax?: number;
    priceMin?: number;
    priceMax?: number;
    fuel?: FuelType;
    transmission?: Transmission;
    color?: string;
    category?: string;
    featured?: string;
}
export {};
