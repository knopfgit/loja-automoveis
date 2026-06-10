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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
const dec = (v) => (v ? Number(v) : 0);
let DashboardService = class DashboardService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    startOfMonth() {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    async adminDashboard() {
        return this.redis.remember('dashboard:admin', () => this.computeAdmin(), 30);
    }
    async computeAdmin() {
        const monthStart = this.startOfMonth();
        const [available, inMaintenance, reserved, sold, revenueMonthAgg, revenueTotalAgg, expensesTotalAgg, dreAgg, commissionsPending, commissionsPaid, pendingDocs, leadsPending, leadsTotal, leadsConverted,] = await Promise.all([
            this.prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
            this.prisma.vehicle.count({ where: { status: 'IN_MAINTENANCE' } }),
            this.prisma.vehicle.count({ where: { status: 'RESERVED' } }),
            this.prisma.vehicle.count({ where: { status: 'SOLD' } }),
            this.prisma.financialEntry.aggregate({
                _sum: { amount: true },
                where: {
                    nature: 'REVENUE',
                    status: 'CONFIRMED',
                    date: { gte: monthStart },
                },
            }),
            this.prisma.financialEntry.aggregate({
                _sum: { amount: true },
                where: { nature: 'REVENUE', status: 'CONFIRMED' },
            }),
            this.prisma.financialEntry.aggregate({
                _sum: { amount: true },
                where: { nature: 'EXPENSE', status: 'CONFIRMED' },
            }),
            this.prisma.vehicleDre.aggregate({
                _sum: { grossProfit: true, netProfit: true },
                _avg: { profitMargin: true },
            }),
            this.prisma.commission.aggregate({
                _sum: { amount: true },
                where: { status: { in: ['PENDING', 'APPROVED'] } },
            }),
            this.prisma.commission.aggregate({
                _sum: { amount: true },
                where: { status: 'PAID' },
            }),
            this.prisma.document.count({
                where: {
                    status: {
                        in: [
                            'PENDING_REQUEST',
                            'AWAITING_BUYER_DOCUMENT',
                            'AWAITING_SELLER_DOCUMENT',
                            'AWAITING_VEHICLE_DOCUMENT',
                            'UNDER_REVIEW',
                        ],
                    },
                },
            }),
            this.prisma.lead.count({
                where: { status: { in: ['NEW', 'ASSIGNED'] } },
            }),
            this.prisma.lead.count(),
            this.prisma.lead.count({ where: { status: 'CONVERTED' } }),
        ]);
        const parts = await this.prisma.part.findMany({
            where: { status: 'ACTIVE' },
            select: { quantity: true, minQuantity: true },
        });
        const lowStockParts = parts.filter((p) => p.quantity <= p.minQuantity).length;
        const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiringDocs = await this.prisma.document.count({
            where: { expiryDate: { gte: new Date(), lte: in30 } },
        });
        const salesBySellerRaw = await this.prisma.vehicleSale.groupBy({
            by: ['sellerId'],
            where: { status: 'COMPLETED', saleDate: { gte: monthStart } },
            _count: { _all: true },
            _sum: { finalPrice: true },
        });
        const sellerIds = salesBySellerRaw.map((s) => s.sellerId);
        const sellers = await this.prisma.employee.findMany({
            where: { id: { in: sellerIds } },
            select: { id: true, fullName: true },
        });
        const salesBySeller = salesBySellerRaw.map((s) => ({
            sellerId: s.sellerId,
            sellerName: sellers.find((e) => e.id === s.sellerId)?.fullName ?? '—',
            count: s._count._all,
            total: dec(s._sum.finalPrice),
        }));
        const salesThisMonth = await this.prisma.vehicleSale.count({
            where: { status: 'COMPLETED', saleDate: { gte: monthStart } },
        });
        const longestInStock = await this.prisma.vehicleDre.findMany({
            include: {
                vehicle: { select: { brand: true, model: true, status: true } },
            },
            orderBy: { daysInStock: 'desc' },
            take: 5,
        });
        return {
            vehicles: { available, inMaintenance, reserved, sold },
            finance: {
                revenueMonth: dec(revenueMonthAgg._sum.amount),
                revenueTotal: dec(revenueTotalAgg._sum.amount),
                totalExpenses: dec(expensesTotalAgg._sum.amount),
                grossProfit: dec(dreAgg._sum.grossProfit),
                netProfit: dec(dreAgg._sum.netProfit),
                avgMargin: dec(dreAgg._avg.profitMargin),
                commissionsPending: dec(commissionsPending._sum.amount),
                commissionsPaid: dec(commissionsPaid._sum.amount),
            },
            alerts: {
                lowStockParts,
                pendingDocuments: pendingDocs,
                expiringDocuments: expiringDocs,
            },
            sales: { thisMonth: salesThisMonth, bySeller: salesBySeller },
            leads: {
                pending: leadsPending,
                total: leadsTotal,
                converted: leadsConverted,
                conversionRate: leadsTotal > 0
                    ? Math.round((leadsConverted / leadsTotal) * 10000) / 100
                    : 0,
            },
            longestInStock: longestInStock.map((d) => ({
                vehicle: `${d.vehicle.brand} ${d.vehicle.model}`,
                daysInStock: d.daysInStock,
                status: d.vehicle.status,
            })),
            generatedAt: new Date().toISOString(),
        };
    }
    async sellerDashboard(employeeId) {
        const monthStart = this.startOfMonth();
        const in3days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const [myLeads, pendingContacts, negotiations, mySalesMonth, myCommissions, reservationsExpiring,] = await Promise.all([
            this.prisma.lead.count({ where: { assignedSellerId: employeeId } }),
            this.prisma.lead.count({
                where: {
                    assignedSellerId: employeeId,
                    status: { in: ['NEW', 'ASSIGNED'] },
                },
            }),
            this.prisma.lead.count({
                where: { assignedSellerId: employeeId, status: 'NEGOTIATING' },
            }),
            this.prisma.vehicleSale.count({
                where: {
                    sellerId: employeeId,
                    status: 'COMPLETED',
                    saleDate: { gte: monthStart },
                },
            }),
            this.prisma.commission.aggregate({
                where: { sellerId: employeeId },
                _sum: { amount: true },
                _count: { _all: true },
            }),
            this.prisma.vehicleReservation.count({
                where: {
                    sellerId: employeeId,
                    status: 'ACTIVE',
                    expiresAt: { lte: in3days, gte: new Date() },
                },
            }),
        ]);
        const commissionsByStatus = await this.prisma.commission.groupBy({
            by: ['status'],
            where: { sellerId: employeeId },
            _sum: { amount: true },
        });
        return {
            leads: { total: myLeads, pendingContacts, negotiations },
            sales: { thisMonth: mySalesMonth },
            commissions: {
                count: myCommissions._count._all,
                total: dec(myCommissions._sum.amount),
                byStatus: commissionsByStatus.map((c) => ({
                    status: c.status,
                    total: dec(c._sum.amount),
                })),
            },
            reservationsExpiring,
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map