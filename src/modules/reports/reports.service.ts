import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DreService } from '../financial/dre.service';

const dec = (v: any) => (v ? Number(v) : 0);

/**
 * Report dataset builders. Each returns a flat array of rows suitable for both
 * JSON and CSV. PDF export can be layered on top of these datasets later.
 */
@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dre: DreService,
  ) {}

  async vehiclesStock() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: { notIn: ['ARCHIVED', 'SOLD', 'DELIVERED'] } },
      orderBy: { createdAt: 'desc' },
    });
    return vehicles.map((v) => ({
      publicCode: v.publicCode,
      brand: v.brand,
      model: v.model,
      modelYear: v.modelYear,
      status: v.status,
      announcedPrice: dec(v.announcedPrice),
      entryDate: v.entryDate,
    }));
  }

  async vehiclesSold() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: { in: ['SOLD', 'DELIVERED'] } },
      orderBy: { soldAt: 'desc' },
    });
    return vehicles.map((v) => ({
      publicCode: v.publicCode,
      brand: v.brand,
      model: v.model,
      modelYear: v.modelYear,
      soldPrice: dec(v.soldPrice),
      soldAt: v.soldAt,
    }));
  }

  async vehiclesAvailable() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
    });
    return vehicles.map((v) => ({
      publicCode: v.publicCode,
      brand: v.brand,
      model: v.model,
      modelYear: v.modelYear,
      announcedPrice: dec(v.announcedPrice),
    }));
  }

  async vehiclesStale(days = 60) {
    const limit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        status: { in: ['AVAILABLE', 'RESERVED', 'NEGOTIATING'] },
        entryDate: { lte: limit },
      },
      include: { dre: true },
      orderBy: { entryDate: 'asc' },
    });
    return vehicles.map((v) => ({
      publicCode: v.publicCode,
      brand: v.brand,
      model: v.model,
      daysInStock: v.dre?.daysInStock ?? null,
      entryDate: v.entryDate,
      announcedPrice: dec(v.announcedPrice),
    }));
  }

  async dreConsolidated(from?: Date, to?: Date) {
    const data = await this.dre.consolidated({ from, to });
    // Flatten for CSV: one totals row + brand rows.
    const rows: Record<string, any>[] = [{ scope: 'TOTAL', ...data.totals }];
    for (const [brand, netProfit] of Object.entries(data.byBrand)) {
      rows.push({ scope: `brand:${brand}`, netProfit });
    }
    return rows;
  }

  async dreByVehicle(vehicleId: string) {
    const detailed = await this.dre.getDetailed(vehicleId);
    return detailed.entries.map((e) => ({
      date: e.date,
      nature: e.nature,
      category: e.category,
      description: e.description,
      amount: dec(e.amount),
      origin: e.origin,
    }));
  }

  async salesByPeriod(from?: Date, to?: Date) {
    const sales = await this.prisma.vehicleSale.findMany({
      where: {
        status: 'COMPLETED',
        saleDate: from || to ? { gte: from, lte: to } : undefined,
      },
      include: {
        vehicle: { select: { brand: true, model: true } },
        seller: { select: { fullName: true } },
        customer: { select: { fullName: true } },
      },
      orderBy: { saleDate: 'desc' },
    });
    return sales.map((s) => ({
      saleDate: s.saleDate,
      vehicle: `${s.vehicle.brand} ${s.vehicle.model}`,
      seller: s.seller.fullName,
      customer: s.customer.fullName,
      finalPrice: dec(s.finalPrice),
      paymentMethod: s.paymentMethod,
    }));
  }

  async salesBySeller() {
    const grouped = await this.prisma.vehicleSale.groupBy({
      by: ['sellerId'],
      where: { status: 'COMPLETED' },
      _count: { _all: true },
      _sum: { finalPrice: true },
    });
    const sellers = await this.prisma.employee.findMany({
      where: { id: { in: grouped.map((g) => g.sellerId) } },
      select: { id: true, fullName: true },
    });
    return grouped.map((g) => ({
      seller: sellers.find((e) => e.id === g.sellerId)?.fullName ?? '—',
      sales: g._count._all,
      total: dec(g._sum.finalPrice),
    }));
  }

  async commissions() {
    const list = await this.prisma.commission.findMany({
      include: {
        seller: { select: { fullName: true } },
        vehicle: { select: { brand: true, model: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });
    return list.map((c) => ({
      seller: c.seller.fullName,
      vehicle: c.vehicle ? `${c.vehicle.brand} ${c.vehicle.model}` : '—',
      amount: dec(c.amount),
      status: c.status,
      generatedAt: c.generatedAt,
      paidAt: c.paidAt,
    }));
  }

  async documentsPending() {
    const docs = await this.prisma.document.findMany({
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
      include: {
        documentType: true,
        vehicle: { select: { brand: true, model: true } },
      },
    });
    return docs.map((d) => ({
      type: d.documentType.name,
      status: d.status,
      vehicle: d.vehicle ? `${d.vehicle.brand} ${d.vehicle.model}` : '—',
      createdAt: d.createdAt,
    }));
  }

  async documentsExpiring(days = 30) {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const docs = await this.prisma.document.findMany({
      where: { expiryDate: { gte: new Date(), lte: until } },
      include: { documentType: true },
      orderBy: { expiryDate: 'asc' },
    });
    return docs.map((d) => ({
      type: d.documentType.name,
      expiryDate: d.expiryDate,
      status: d.status,
    }));
  }

  async maintenances() {
    const list = await this.prisma.maintenance.findMany({
      include: { vehicle: { select: { brand: true, model: true } } },
      orderBy: { openedAt: 'desc' },
    });
    return list.map((m) => ({
      vehicle: `${m.vehicle.brand} ${m.vehicle.model}`,
      type: m.type,
      status: m.status,
      totalCost: dec(m.totalCost),
      openedAt: m.openedAt,
      completedAt: m.completedAt,
    }));
  }

  async futureRevisions() {
    const list = await this.prisma.maintenance.findMany({
      where: { nextRevisionDate: { gte: new Date() } },
      include: { vehicle: { select: { brand: true, model: true } } },
      orderBy: { nextRevisionDate: 'asc' },
    });
    return list.map((m) => ({
      vehicle: `${m.vehicle.brand} ${m.vehicle.model}`,
      nextRevisionDate: m.nextRevisionDate,
      nextRevisionMileage: m.nextRevisionMileage,
    }));
  }

  async partsStock() {
    const parts = await this.prisma.part.findMany({ orderBy: { name: 'asc' } });
    return parts.map((p) => ({
      internalCode: p.internalCode,
      name: p.name,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      costPrice: dec(p.costPrice),
      averagePrice: dec(p.averagePrice),
    }));
  }

  async partsLowStock() {
    const parts = await this.prisma.part.findMany({
      where: { status: 'ACTIVE' },
    });
    return parts
      .filter((p) => p.quantity <= p.minQuantity)
      .map((p) => ({
        internalCode: p.internalCode,
        name: p.name,
        quantity: p.quantity,
        minQuantity: p.minQuantity,
      }));
  }

  async leads() {
    const list = await this.prisma.lead.findMany({
      include: {
        assignedSeller: { select: { fullName: true } },
        vehicle: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((l) => ({
      name: l.name,
      phone: l.phone,
      vehicle: l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model}` : '—',
      seller: l.assignedSeller?.fullName ?? '—',
      status: l.status,
      createdAt: l.createdAt,
    }));
  }

  async conversions() {
    const list = await this.prisma.lead.findMany({
      where: { status: 'CONVERTED' },
      include: { assignedSeller: { select: { fullName: true } } },
    });
    return list.map((l) => ({
      name: l.name,
      seller: l.assignedSeller?.fullName ?? '—',
      convertedAt: l.convertedAt,
    }));
  }

  async marketingInterested() {
    const customers = await this.prisma.customer.findMany({
      where: { marketingConsent: true, anonymizedAt: null },
      include: { marketingPreference: true },
    });
    return customers.map((c) => ({
      name: c.fullName,
      email: c.email,
      interestBrands: c.marketingPreference?.interestBrands ?? [],
      interestModels: c.marketingPreference?.interestModels ?? [],
    }));
  }
}
