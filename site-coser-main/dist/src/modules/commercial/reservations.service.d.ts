import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { StockService } from '../vehicles/stock.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateReservationDto } from './dto/commercial.dto';
export declare class ReservationsService {
    private readonly prisma;
    private readonly config;
    private readonly audit;
    private readonly stock;
    constructor(prisma: PrismaService, config: ConfigService, audit: AuditService, stock: StockService);
    create(dto: CreateReservationDto, actorId?: string): Promise<{
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
        depositAmount: Prisma.Decimal | null;
        cancelReason: string | null;
        customerId: string;
    }>;
    cancel(id: string, reason?: string, actorId?: string): Promise<{
        id: string;
        status: string;
    }>;
    findAll(pg: PaginationQueryDto, filters: {
        status?: string;
        sellerId?: string;
        customerId?: string;
    }): Promise<PaginatedResult<{
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
        depositAmount: Prisma.Decimal | null;
        cancelReason: string | null;
        customerId: string;
    }>>;
}
