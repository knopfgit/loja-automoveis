import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/part.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSupplierDto): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        active: boolean;
        document: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(pg: PaginationQueryDto): Promise<PaginatedResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        active: boolean;
        document: string | null;
    }>>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        active: boolean;
        document: string | null;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        active: boolean;
        document: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
