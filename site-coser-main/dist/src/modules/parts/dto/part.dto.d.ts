import { PartMovementType } from '@prisma/client';
export declare class CreatePartDto {
    internalCode: string;
    sku?: string;
    barcode?: string;
    name: string;
    category?: string;
    brand?: string;
    compatibleModel?: string;
    description?: string;
    quantity?: number;
    minQuantity?: number;
    unit?: string;
    costPrice?: number;
    location?: string;
    supplierId?: string;
    notes?: string;
}
declare const UpdatePartDto_base: import("@nestjs/common").Type<Partial<CreatePartDto>>;
export declare class UpdatePartDto extends UpdatePartDto_base {
}
export declare class PartMovementDto {
    type: PartMovementType;
    quantity: number;
    unitCost?: number;
    vehicleId?: string;
    reason?: string;
    notes?: string;
}
export declare class CreateSupplierDto {
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    notes?: string;
}
declare const UpdateSupplierDto_base: import("@nestjs/common").Type<Partial<CreateSupplierDto>>;
export declare class UpdateSupplierDto extends UpdateSupplierDto_base {
}
export {};
