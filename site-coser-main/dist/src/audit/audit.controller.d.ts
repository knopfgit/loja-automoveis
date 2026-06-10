import { AuditAction } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findMany(pagination: PaginationQueryDto, entity?: string, entityId?: string, actorId?: string, action?: AuditAction): Promise<import("../common/dto/paginated-result").PaginatedResult<any>>;
}
