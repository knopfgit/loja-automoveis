import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { FinancialService } from '../financial/financial.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateAcquisitionDto } from './dto/commercial.dto';
export declare class AcquisitionsService {
    private readonly prisma;
    private readonly audit;
    private readonly financial;
    constructor(prisma: PrismaService, audit: AuditService, financial: FinancialService);
    create(dto: CreateAcquisitionDto, actorId?: string): Promise<{
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
    findAll(pg: PaginationQueryDto): Promise<PaginatedResult<{
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
}
