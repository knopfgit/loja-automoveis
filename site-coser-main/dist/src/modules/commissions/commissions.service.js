"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const dre_service_1 = require("../financial/dre.service");
const notifications_service_1 = require("../notifications/notifications.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const dec = (v) => v ? Number(v) : 0;
let CommissionsService = class CommissionsService {
    constructor(prisma, audit, realtime, dre, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.dre = dre;
        this.notifications = notifications;
    }
    createRule(dto) {
        return this.prisma.commissionRule.create({
            data: {
                name: dto.name,
                type: dto.type,
                percentage: dto.percentage,
                fixedAmount: dto.fixedAmount,
                tiers: dto.tiers ?? undefined,
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
    async updateRule(id, dto) {
        const rule = await this.prisma.commissionRule.findUnique({ where: { id } });
        if (!rule)
            throw new app_exception_1.AppException('COMMISSION_RULE_NOT_FOUND');
        return this.prisma.commissionRule.update({
            where: { id },
            data: {
                ...dto,
                tiers: dto.tiers ?? undefined,
            },
        });
    }
    async resolveRule(sellerId) {
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
    computeAmount(rule, finalPrice, netProfit) {
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
                const tiers = Array.isArray(rule.tiers) ? rule.tiers : [];
                const tier = tiers.find((t) => finalPrice >= t.min && (t.max === null || finalPrice <= t.max));
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
    async generateForSale(sale, actorId) {
        const existing = await this.prisma.commission.findUnique({
            where: { saleId: sale.id },
        });
        if (existing)
            return existing;
        const rule = await this.resolveRule(sale.sellerId);
        if (!rule) {
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
        const { base, percentage, amount } = this.computeAmount(rule, finalPrice, netProfit);
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
        this.realtime.emit(events_constants_1.EVENTS.COMMISSION_GENERATED, { id: commission.id, amount }, { roles: ['ADMIN'], sellerId: sale.sellerId });
        return commission;
    }
    async approve(id, actorId) {
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
        await this.notifySeller(updated, 'commission-approved', events_constants_1.EVENTS.COMMISSION_APPROVED);
        return updated;
    }
    async pay(id, actorId) {
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
        await this.notifySeller(updated, 'commission-paid', events_constants_1.EVENTS.COMMISSION_PAID);
        return updated;
    }
    async cancel(id, actorId) {
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
        await this.dre.recalculate(commission.vehicleId);
        return updated;
    }
    async adjust(id, dto, actorId) {
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
        if (commission.vehicleId)
            await this.dre.recalculate(commission.vehicleId);
        return updated;
    }
    async notifySeller(commission, template, event) {
        const user = commission.seller?.user;
        if (user) {
            await this.notifications.create({
                userId: user.id,
                type: event,
                title: template === 'commission-paid'
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
        this.realtime.emit(event, { id: commission.id, amount: dec(commission.amount) }, { roles: ['ADMIN'], sellerId: commission.sellerId });
    }
    async getOrThrow(id) {
        const commission = await this.prisma.commission.findUnique({
            where: { id },
        });
        if (!commission)
            throw new app_exception_1.AppException('COMMISSION_NOT_FOUND');
        return commission;
    }
    async findAll(pg, filters) {
        const where = {
            sellerId: filters.sellerId,
            status: filters.status,
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    findMine(sellerId, pg, status) {
        return this.findAll(pg, { sellerId, status });
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        dre_service_1.DreService,
        notifications_service_1.NotificationsService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map