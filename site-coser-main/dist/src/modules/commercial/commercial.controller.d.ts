import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AcquisitionsService } from './acquisitions.service';
import { ReservationsService } from './reservations.service';
import { SalesService } from './sales.service';
import { CancelReservationDto, CreateAcquisitionDto, CreateReservationDto, CreateSaleDto, UpdateSaleDto, UpdateSaleStatusDto } from './dto/commercial.dto';
export declare class AcquisitionsController {
    private readonly service;
    constructor(service: AcquisitionsService);
    create(dto: CreateAcquisitionDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AcquisitionStatus;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        responsibleId: string | null;
        notes: string | null;
        type: import(".prisma/client").$Enums.AcquisitionType;
        sellerName: string | null;
        sellerDocument: string | null;
        purchaseDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        additionalCosts: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(pg: PaginationQueryDto): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
            modelYear: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AcquisitionStatus;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        responsibleId: string | null;
        notes: string | null;
        type: import(".prisma/client").$Enums.AcquisitionType;
        sellerName: string | null;
        sellerDocument: string | null;
        purchaseDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        additionalCosts: import("@prisma/client/runtime/library").Decimal | null;
    }>>;
    findOne(vehicleId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AcquisitionStatus;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        responsibleId: string | null;
        notes: string | null;
        type: import(".prisma/client").$Enums.AcquisitionType;
        sellerName: string | null;
        sellerDocument: string | null;
        purchaseDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        additionalCosts: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
export declare class ReservationsController {
    private readonly service;
    constructor(service: ReservationsService);
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        sellerId: string | null;
        reservedAt: Date;
        expiresAt: Date;
        depositAmount: import("@prisma/client/runtime/library").Decimal | null;
        cancelReason: string | null;
        customerId: string;
    }>;
    findAll(user: AuthUser, pg: PaginationQueryDto, status?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
            modelYear: number;
        };
        customer: {
            fullName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        sellerId: string | null;
        reservedAt: Date;
        expiresAt: Date;
        depositAmount: import("@prisma/client/runtime/library").Decimal | null;
        cancelReason: string | null;
        customerId: string;
    }>>;
    cancel(id: string, dto: CancelReservationDto, user: AuthUser): Promise<{
        id: string;
        status: string;
    }>;
}
export declare class SalesController {
    private readonly service;
    constructor(service: SalesService);
    create(dto: CreateSaleDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>;
    findAll(user: AuthUser, pg: PaginationQueryDto, status?: string, sellerId?: string, from?: string, to?: string): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        vehicle: {
            brand: string;
            model: string;
        };
        customer: {
            fullName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>>;
    findOne(id: string, user: AuthUser): Promise<{
        vehicle: {
            brand: string;
            model: string;
            modelYear: number;
        };
        customer: {
            fullName: string;
        };
        commission: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            calcBase: import("@prisma/client/runtime/library").Decimal;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
            sellerId: string;
            generatedAt: Date;
            approvedAt: Date | null;
            paidAt: Date | null;
            approvedById: string | null;
            manualAdjustment: boolean;
            saleId: string;
            ruleId: string | null;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>;
    update(id: string, dto: UpdateSaleDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateSaleStatusDto, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>;
    deliver(id: string, user: AuthUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        announcedPrice: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string;
        notes: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        installments: number | null;
        sellerId: string;
        customerId: string;
        saleDate: Date | null;
        negotiatedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discount: import("@prisma/client/runtime/library").Decimal | null;
        finalPrice: import("@prisma/client/runtime/library").Decimal | null;
        downPayment: import("@prisma/client/runtime/library").Decimal | null;
        financing: boolean;
        financialInstitution: string | null;
        tradeInVehicleId: string | null;
        deliveryForecast: Date | null;
        deliveredAt: Date | null;
    }>;
}
