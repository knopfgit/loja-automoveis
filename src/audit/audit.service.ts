import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
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

/**
 * Central audit trail writer. Never throws into the caller's flow: a failed
 * audit write is logged but must not break the business operation.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId ?? null,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          before: (entry.before as Prisma.InputJsonValue) ?? undefined,
          after: (entry.after as Prisma.InputJsonValue) ?? undefined,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          source: entry.source ?? 'api',
          reason: entry.reason ?? null,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for ${entry.entity}:${entry.entityId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async findMany(params: {
    page: number;
    limit: number;
    entity?: string;
    entityId?: string;
    actorId?: string;
    action?: AuditAction;
  }): Promise<PaginatedResult<any>> {
    const where: Prisma.AuditLogWhereInput = {
      entity: params.entity,
      entityId: params.entityId,
      actorId: params.actorId,
      action: params.action,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return PaginatedResult.of(items, total, params.page, params.limit);
  }
}
