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
exports.DreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const round2 = (n) => Math.round(n * 100) / 100;
const dec = (v) => (v ? Number(v) : 0);
let DreService = class DreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recalculate(vehicleId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: { sales: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        const entries = await this.prisma.financialEntry.findMany({
            where: { vehicleId, status: 'CONFIRMED' },
        });
        let totalRevenue = 0;
        let expenseSansCommission = 0;
        let purchaseInEntries = 0;
        const categoryBreakdown = {};
        for (const e of entries) {
            const amount = dec(e.amount);
            if (e.nature === 'REVENUE') {
                totalRevenue += amount;
            }
            else {
                if (e.category === 'Comissão')
                    continue;
                expenseSansCommission += amount;
                if (e.category === 'Compra do veículo')
                    purchaseInEntries += amount;
                categoryBreakdown[e.category] =
                    (categoryBreakdown[e.category] || 0) + amount;
            }
        }
        if (purchaseInEntries === 0 && dec(vehicle.purchasePrice) > 0) {
            const p = dec(vehicle.purchasePrice);
            expenseSansCommission += p;
            categoryBreakdown['Compra do veículo'] =
                (categoryBreakdown['Compra do veículo'] || 0) + p;
        }
        const commissionAgg = await this.prisma.commission.aggregate({
            where: { vehicleId, status: { not: 'CANCELED' } },
            _sum: { amount: true },
        });
        const commissionTotal = dec(commissionAgg._sum.amount);
        if (commissionTotal > 0) {
            categoryBreakdown['Comissão'] = commissionTotal;
        }
        const totalExpenses = round2(expenseSansCommission);
        const totalInvested = totalExpenses;
        const grossProfit = round2(totalRevenue - totalExpenses);
        const netProfit = round2(grossProfit - commissionTotal);
        const profitMargin = totalRevenue > 0 ? round2((netProfit / totalRevenue) * 100) : 0;
        const startDate = vehicle.entryDate ?? vehicle.createdAt;
        const endDate = vehicle.soldAt ?? new Date();
        const daysInStock = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const costPerDay = round2(totalInvested / Math.max(1, daysInStock));
        const sale = vehicle.sales[0];
        const discountGiven = sale ? dec(sale.discount) : 0;
        const dre = await this.prisma.vehicleDre.upsert({
            where: { vehicleId },
            create: {
                vehicleId,
                totalInvested,
                totalExpenses,
                totalRevenue: round2(totalRevenue),
                grossProfit,
                commissionTotal: round2(commissionTotal),
                netProfit,
                profitMargin,
                daysInStock,
                costPerDay,
                discountGiven,
                categoryBreakdown,
                lastCalculatedAt: new Date(),
            },
            update: {
                totalInvested,
                totalExpenses,
                totalRevenue: round2(totalRevenue),
                grossProfit,
                commissionTotal: round2(commissionTotal),
                netProfit,
                profitMargin,
                daysInStock,
                costPerDay,
                discountGiven,
                categoryBreakdown,
                lastCalculatedAt: new Date(),
            },
        });
        return dre;
    }
    async getByVehicle(vehicleId) {
        const dre = await this.prisma.vehicleDre.findUnique({
            where: { vehicleId },
            include: {
                vehicle: {
                    select: {
                        id: true,
                        brand: true,
                        model: true,
                        modelYear: true,
                        status: true,
                        announcedPrice: true,
                        soldPrice: true,
                    },
                },
            },
        });
        if (!dre)
            return this.recalculate(vehicleId);
        return dre;
    }
    async getDetailed(vehicleId) {
        const [dre, entries] = await Promise.all([
            this.getByVehicle(vehicleId),
            this.prisma.financialEntry.findMany({
                where: { vehicleId },
                orderBy: { date: 'asc' },
            }),
        ]);
        return { summary: dre, entries };
    }
    async consolidated(params) {
        const dateFilter = params.from || params.to
            ? { gte: params.from, lte: params.to }
            : undefined;
        const dres = await this.prisma.vehicleDre.findMany({
            include: {
                vehicle: {
                    select: {
                        brand: true,
                        model: true,
                        status: true,
                        soldAt: true,
                    },
                },
            },
            where: dateFilter ? { vehicle: { soldAt: dateFilter } } : undefined,
        });
        const sum = (key) => round2(dres.reduce((acc, d) => acc + dec(d[key]), 0));
        const byBrand = {};
        const byStatus = {};
        const categoryTotals = {};
        for (const d of dres) {
            byBrand[d.vehicle.brand] =
                (byBrand[d.vehicle.brand] || 0) + dec(d.netProfit);
            byStatus[d.vehicle.status] =
                (byStatus[d.vehicle.status] || 0) + dec(d.netProfit);
            const cb = d.categoryBreakdown || {};
            for (const [cat, val] of Object.entries(cb)) {
                categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(val);
            }
        }
        return {
            totals: {
                totalRevenue: sum('totalRevenue'),
                totalExpenses: sum('totalExpenses'),
                grossProfit: sum('grossProfit'),
                commissionTotal: sum('commissionTotal'),
                netProfit: sum('netProfit'),
                vehicles: dres.length,
            },
            byBrand,
            byStatus,
            categoryTotals,
            mostProfitable: [...dres]
                .sort((a, b) => dec(b.netProfit) - dec(a.netProfit))
                .slice(0, 10)
                .map((d) => ({
                vehicle: `${d.vehicle.brand} ${d.vehicle.model}`,
                netProfit: dec(d.netProfit),
            })),
            longestInStock: [...dres]
                .sort((a, b) => b.daysInStock - a.daysInStock)
                .slice(0, 10)
                .map((d) => ({
                vehicle: `${d.vehicle.brand} ${d.vehicle.model}`,
                daysInStock: d.daysInStock,
            })),
            highestCost: [...dres]
                .sort((a, b) => dec(b.totalInvested) - dec(a.totalInvested))
                .slice(0, 10)
                .map((d) => ({
                vehicle: `${d.vehicle.brand} ${d.vehicle.model}`,
                totalInvested: dec(d.totalInvested),
            })),
        };
    }
};
exports.DreService = DreService;
exports.DreService = DreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DreService);
//# sourceMappingURL=dre.service.js.map