import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(pg: PaginationQueryDto, role?: UserRole, status?: UserStatus) {
    const where: Prisma.UserWhereInput = { role, status };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          employee: { select: { id: true, fullName: true } },
          customer: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async setStatus(id: string, status: UserStatus, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppException('NOT_FOUND');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });
    // Block also revokes active sessions.
    if (status !== 'ACTIVE') {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      before: { status: user.status },
      after: { status },
      reason: 'status_change',
    });
    return { id: updated.id, status: updated.status };
  }

  async assignRoleProfile(
    id: string,
    roleProfileId: string | null,
    actorId?: string,
  ) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { roleProfileId },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      reason: 'role_profile_assigned',
      after: { roleProfileId },
    });
    return { id: updated.id, roleProfileId: updated.roleProfileId };
  }

  async loginHistory(id: string, pg: PaginationQueryDto) {
    const where = { userId: id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.loginHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.loginHistory.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }
}
