import { Injectable } from '@nestjs/common';
import { Prisma, VehicleSale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { DreService } from '../financial/dre.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  AdjustCommissionDto,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
} from './dto/commission.dto';

const dec = (v: Prisma.Decimal | number | null | undefined) =>
  v ? Number(v) : 0;

@Injectable()
export class CommissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly dre: DreService,
    private readonly notifications: NotificationsService,
  ) {}

  // ----------------------------------------------------------- rules
  createRule(dto: CreateCommissionRuleDto) {
    return this.prisma.commissionRule.create({
      data: {
        name: dto.name,
        type: dto.type,
        percentage: dto.percentage,
        fixedAmount: dto.fixedAmount,
        tiers: (dto.tiers as Prisma.InputJsonValue) ?? undefined,
        isDefault: dto.isDefault ?? false,
        description: dto.description,
      },
    });
  }

  listRules() {
    return this.prisma.commissionRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRule(id: string, dto: UpdateCommissionRuleDto) {
    const rule = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!rule) throw new AppException('COMMISSION_RULE_NOT_FOUND');
    return this.prisma.commissionRule.update({
      where: { id },
      data: {
        ...dto,
        tiers: (dto.tiers as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  private async resolveRule(sellerId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: sellerId },
      include: { defaultCommissionRule: true },
    });
    if (employee?.defaultCommissionRule?.active) {
      return employee.defaultCommissionRule;
    }
    return this.prisma.commissionRule.findFirst({
      where: { isDefault: true, active: true },
    });
  }

  private computeAmount(
    rule: { type: string; percentage: any; fixedAmount: any; tiers: any },
    finalPrice: number,
    netProfit: number,
  ): { base: number; percentage: number | null; amount: number } {
    switch (rule.type) {
      case 'PERCENT_SALE': {
        const pct = dec(rule.percentage);
        return {
          base: finalPrice,
          percentage: pct,
          amount: (finalPrice * pct) / 100,
        };
      }
      case 'PERCENT_PROFIT': {
        const pct = dec(rule.percentage);
        const base = Math.max(0, netProfit);
        return { base, percentage: pct, amount: (base * pct) / 100 };
      }
      case 'FIXED': {
        return { base: 0, percentage: null, amount: dec(rule.fixedAmount) };
      }
      case 'PROGRESSIVE': {
        const tiers: { min: number; max: number | null; percentage: number }[] =
          Array.isArray(rule.tiers) ? rule.tiers : [];
        const tier = tiers.find(
          (t) => finalPrice >= t.min && (t.max === null || finalPrice <= t.max),
        );
        const pct = tier ? tier.percentage : 0;
        return {
          base: finalPrice,
          percentage: pct,
          amount: (finalPrice * pct) / 100,
        };
      }
      default:
        return { base: 0, percentage: null, amount: 0 };
    }
  }

  /** Generate (or replace) the commission for a completed sale. */
  async generateForSale(sale: VehicleSale, actorId?: string) {
    const existing = await this.prisma.commission.findUnique({
      where: { saleId: sale.id },
    });
    if (existing) return existing;

    const rule = await this.resolveRule(sale.sellerId);
    if (!rule) {
      // No rule configured: create a zero commission so it is visible/auditable.
      const zero = await this.prisma.commission.create({
        data: {
          sellerId: sale.sellerId,
          saleId: sale.id,
          vehicleId: sale.vehicleId,
          calcBase: 0,
          amount: 0,
          notes: 'Nenhuma regra de comissão configurada.',
        },
      });
      return zero;
    }

    const finalPrice = dec(sale.finalPrice);
    let netProfit = 0;
    if (rule.type === 'PERCENT_PROFIT') {
      const dre = await this.dre.recalculate(sale.vehicleId);
      netProfit = dec(dre.netProfit);
    }

    const { base, percentage, amount } = this.computeAmount(
      rule,
      finalPrice,
      netProfit,
    );

    const commission = await this.prisma.commission.create({
      data: {
        sellerId: sale.sellerId,
        saleId: sale.id,
        vehicleId: sale.vehicleId,
        ruleId: rule.id,
        calcBase: base,
        percentage: percentage ?? undefined,
        amount,
      },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Commission',
      entityId: commission.id,
      after: { amount, ruleType: rule.type },
    });

    await this.dre.recalculate(sale.vehicleId);

    this.realtime.emit(
      EVENTS.COMMISSION_GENERATED,
      { id: commission.id, amount },
      { roles: ['ADMIN'], sellerId: sale.sellerId },
    );

    return commission;
  }

  // ----------------------------------------------------------- lifecycle
  async approve(id: string, actorId?: string) {
    await this.getOrThrow(id);
    const updated = await this.prisma.commission.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: actorId,
      },
      include: { seller: { include: { user: true } } },
    });
    await this.audit.log({
      actorId,
      action: 'APPROVE',
      entity: 'Commission',
      entityId: id,
    });
    await this.notifySeller(
      updated,
      'commission-approved',
      EVENTS.COMMISSION_APPROVED,
    );
    return updated;
  }

  async pay(id: string, actorId?: string) {
    await this.getOrThrow(id);
    const updated = await this.prisma.commission.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
      include: { seller: { include: { user: true } } },
    });
    await this.audit.log({
      actorId,
      action: 'PAY',
      entity: 'Commission',
      entityId: id,
    });
    await this.notifySeller(updated, 'commission-paid', EVENTS.COMMISSION_PAID);
    return updated;
  }

  async cancel(id: string, actorId?: string) {
    const commission = await this.getOrThrow(id);
    const updated = await this.prisma.commission.update({
      where: { id },
      data: { status: 'CANCELED' },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Commission',
      entityId: id,
      reason: 'canceled',
    });
    await this.dre.recalculate(commission.vehicleId!);
    return updated;
  }

  async adjust(id: string, dto: AdjustCommissionDto, actorId?: string) {
    const commission = await this.getOrThrow(id);
    const updated = await this.prisma.commission.update({
      where: { id },
      data: {
        amount: dto.amount,
        manualAdjustment: true,
        notes: dto.reason,
      },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Commission',
      entityId: id,
      before: { amount: dec(commission.amount) },
      after: { amount: dto.amount },
      reason: dto.reason,
    });
    if (commission.vehicleId) await this.dre.recalculate(commission.vehicleId);
    return updated;
  }

  private async notifySeller(commission: any, template: string, event: string) {
    const user = commission.seller?.user;
    if (user) {
      await this.notifications.create({
        userId: user.id,
        type: event,
        title:
          template === 'commission-paid'
            ? 'Comissão paga'
            : 'Comissão aprovada',
        body: `Valor: R$ ${dec(commission.amount).toFixed(2)}`,
        data: { commissionId: commission.id },
        email: {
          to: user.email,
          template,
          context: { amount: dec(commission.amount).toFixed(2) },
        },
      });
    }
    this.realtime.emit(
      event,
      { id: commission.id, amount: dec(commission.amount) },
      { roles: ['ADMIN'], sellerId: commission.sellerId },
    );
  }

  private async getOrThrow(id: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id },
    });
    if (!commission) throw new AppException('COMMISSION_NOT_FOUND');
    return commission;
  }

  // ----------------------------------------------------------- queries
  async findAll(
    pg: PaginationQueryDto,
    filters: { sellerId?: string; status?: string },
  ) {
    const where: Prisma.CommissionWhereInput = {
      sellerId: filters.sellerId,
      status: filters.status as any,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.commission.findMany({
        where,
        include: {
          sale: { select: { id: true, finalPrice: true } },
          vehicle: { select: { brand: true, model: true } },
        },
        orderBy: { generatedAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.commission.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  /** Seller view: only own commissions. */
  findMine(sellerId: string, pg: PaginationQueryDto, status?: string) {
    return this.findAll(pg, { sellerId, status });
  }
}
