import { MaintenanceType } from '@prisma/client';
export declare class CreateMaintenanceDto {
    vehicleId: string;
    type?: MaintenanceType;
    description?: string;
    workshop?: string;
    supplierId?: string;
    forecastDate?: string;
    mileage?: number;
    laborCost?: number;
    invoiceNumber?: string;
    warranty?: string;
    notes?: string;
}
declare const UpdateMaintenanceDto_base: import("@nestjs/common").Type<Partial<CreateMaintenanceDto>>;
export declare class UpdateMaintenanceDto extends UpdateMaintenanceDto_base {
}
export declare class AddMaintenancePartDto {
    partId: string;
    quantity: number;
}
export declare class CompleteMaintenanceDto {
    laborCost?: number;
    nextRevisionDate?: string;
    nextRevisionMileage?: number;
    notes?: string;
}
export {};
