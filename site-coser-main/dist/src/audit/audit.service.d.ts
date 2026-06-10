import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated-result';
export interface AuditContext {
    actorId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    source?: string;
    reason?: string | null;
}
export interface AuditEntry extends AuditContext {
    action: AuditAction;
    entity: string;
    entityId?: string | null;
    before?: unknown;
    after?: unknown;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(entry: AuditEntry): Promise<void>;
    findMany(params: {
        page: number;
        limit: number;
        entity?: string;
        entityId?: string;
        actorId?: string;
        action?: AuditAction;
    }): Promise<PaginatedResult<any>>;
}
