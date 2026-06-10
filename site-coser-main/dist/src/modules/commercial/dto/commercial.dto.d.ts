import { AcquisitionType, PaymentMethod, SaleStatus } from '@prisma/client';
export declare class CreateAcquisitionDto {
    vehicleId: string;
    type?: AcquisitionType;
    sellerName?: string;
    sellerDocument?: string;
    purchasePrice: number;
    purchaseDate: string;
    paymentMethod?: PaymentMethod;
    installments?: number;
    additionalCosts?: number;
    notes?: string;
    confirm?: boolean;
}
export declare class CreateReservationDto {
    vehicleId: string;
    customerId: string;
    sellerId?: string;
    durationDays?: number;
    depositAmount?: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
}
export declare class CancelReservationDto {
    reason?: string;
}
export declare class CreateSaleDto {
    vehicleId: string;
    customerId: string;
    sellerId?: string;
    announcedPrice?: number;
    negotiatedPrice?: number;
    discount?: number;
    paymentMethod?: PaymentMethod;
    downPayment?: number;
    installments?: number;
    financing?: boolean;
    financialInstitution?: string;
    tradeInVehicleId?: string;
    deliveryForecast?: string;
    notes?: string;
}
declare const UpdateSaleDto_base: import("@nestjs/common").Type<Partial<CreateSaleDto>>;
export declare class UpdateSaleDto extends UpdateSaleDto_base {
}
export declare class UpdateSaleStatusDto {
    status: SaleStatus;
    finalPrice?: number;
    notes?: string;
}
export {};
