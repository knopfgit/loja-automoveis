import { FinancialNature, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { DreService } from './dre.service';
export interface AutoEntryInput {
    vehicleId: string;
    nature: FinancialNature;
    category: string;
    amount: number;
    description?: string;
    sourceModule: string;
    externalRef?: string;
    responsibleId?: string;
}
export interface ManualEntryInput {
    vehicleId?: string;
    nature: FinancialNature;
    category: string;
    amount: number;
    description?: string;
    date?: string;
    notes?: string;
    documentId?: string;
}
export declare class FinancialService {
    private readonly prisma;
    private readonly dre;
    private readonly audit;
    constructor(prisma: PrismaService, dre: DreService, audit: AuditService);
    addAutomaticEntry(input: AutoEntryInput): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialStatus;
        category: string;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        nature: import(".prisma/client").$Enums.FinancialNature;
        description: string | null;
        amount: Prisma.Decimal;
        date: Date;
        sourceModule: string | null;
        externalRef: string | null;
        documentId: string | null;
        responsibleId: string | null;
        notes: string | null;
    }>;
    removeBySourceRef(sourceModule: string, externalRef: string, vehicleId?: string): Promise<Prisma.BatchPayload>;
    createManual(input: ManualEntryInput, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialStatus;
        category: string;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        nature: import(".prisma/client").$Enums.FinancialNature;
        description: string | null;
        amount: Prisma.Decimal;
        date: Date;
        sourceModule: string | null;
        externalRef: string | null;
        documentId: string | null;
        responsibleId: string | null;
        notes: string | null;
    }>;
    remove(id: string, actorId?: string): Promise<{
        success: boolean;
    }>;
    listByVehicle(vehicleId: string, page: number, limit: number): Promise<PaginatedResult<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialStatus;
        category: string;
        origin: import(".prisma/client").$Enums.FinancialOrigin;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        nature: import(".prisma/client").$Enums.FinancialNature;
        description: string | null;
        amount: Prisma.Decimal;
        date: Date;
        sourceModule: string | null;
        externalRef: string | null;
        documentId: string | null;
        responsibleId: string | null;
        notes: string | null;
    }>>;
}
