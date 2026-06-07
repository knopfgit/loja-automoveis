import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

const dec = (v: any) => (v ? Number(v) : 0);

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private startOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  async adminDashboard() {
    return this.redis.remember(
      'dashboard:admin',
      () => this.computeAdmin(),
      30,
    );
  }

  private async computeAdmin() {
    const monthStart = this.startOfMonth();

    const [
      available,
      inMaintenance,
      reserved,
      sold,
      revenueMonthAgg,
      revenueTotalAgg,
      expensesTotalAgg,
      dreAgg,
      commissionsPending,
      commissionsPaid,
      pendingDocs,
      leadsPending,
      leadsTotal,
      leadsConverted,
    ] = await Promise.all([
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

    // Low stock parts (column comparison done in memory).
    const parts = await this.prisma.part.findMany({
      where: { status: 'ACTIVE' },
      select: { quantity: true, minQuantity: true },
    });
    const lowStockParts = parts.filter(
      (p) => p.quantity <= p.minQuantity,
    ).length;

    // Expiring documents in next 30 days.
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringDocs = await this.prisma.document.count({
      where: { expiryDate: { gte: new Date(), lte: in30 } },
    });

    // Sales by seller (this month).
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
        conversionRate:
          leadsTotal > 0
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

  async sellerDashboard(employeeId: string) {
    const monthStart = this.startOfMonth();
    const in3days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const [
      myLeads,
      pendingContacts,
      negotiations,
      mySalesMonth,
      myCommissions,
      reservationsExpiring,
    ] = await Promise.all([
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
}
