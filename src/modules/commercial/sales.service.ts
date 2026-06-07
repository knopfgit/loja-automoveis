import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { StockService } from '../vehicles/stock.service';
import { FinancialService } from '../financial/financial.service';
import { FINANCIAL_CATEGORIES } from '../financial/financial.constants';
import { CommissionsService } from '../commissions/commissions.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  CreateSaleDto,
  UpdateSaleDto,
  UpdateSaleStatusDto,
} from './dto/commercial.dto';

const dec = (v: any) => (v ? Number(v) : 0);

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly stock: StockService,
    private readonly financial: FinancialService,
    private readonly commissions: CommissionsService,
  ) {}

  private computeFinal(dto: {
    announcedPrice?: number;
    negotiatedPrice?: number;
    discount?: number;
  }): number {
    const base = dto.negotiatedPrice ?? dto.announcedPrice ?? 0;
    return Math.max(0, base - (dto.discount ?? 0));
  }

  async create(
    dto: CreateSaleDto,
    sellerIdFallback?: string,
    actorId?: string,
  ) {
    const sellerId = dto.sellerId ?? sellerIdFallback;
    if (!sellerId) {
      throw new AppException('EMPLOYEE_NOT_FOUND', 'Vendedor não informado.');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    const finalPrice = this.computeFinal({
      announcedPrice: dto.announcedPrice ?? dec(vehicle.announcedPrice),
      negotiatedPrice: dto.negotiatedPrice,
      discount: dto.discount,
    });

    const sale = await this.prisma.vehicleSale.create({
      data: {
        vehicleId: dto.vehicleId,
        customerId: dto.customerId,
        sellerId,
        announcedPrice: dto.announcedPrice ?? vehicle.announcedPrice,
        negotiatedPrice: dto.negotiatedPrice,
        discount: dto.discount,
        finalPrice,
        paymentMethod: dto.paymentMethod,
        downPayment: dto.downPayment,
        installments: dto.installments,
        financing: dto.financing ?? false,
        financialInstitution: dto.financialInstitution,
        tradeInVehicleId: dto.tradeInVehicleId,
        deliveryForecast: dto.deliveryForecast
          ? new Date(dto.deliveryForecast)
          : undefined,
        notes: dto.notes,
        status: 'NEGOTIATING',
      },
    });

    // Move vehicle into negotiation if possible.
    if (this.stock.isTransitionAllowed(vehicle.status, 'NEGOTIATING')) {
      await this.stock.changeStatus(
        dto.vehicleId,
        'NEGOTIATING',
        { reason: 'sale_started' },
        actorId,
      );
    }

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'VehicleSale',
      entityId: sale.id,
      after: { vehicleId: dto.vehicleId, sellerId, finalPrice },
    });

    this.realtime.emit(
      EVENTS.SALE_CREATED,
      { id: sale.id, vehicleId: dto.vehicleId },
      { roles: ['ADMIN'], sellerId },
    );

    return sale;
  }

  async update(id: string, dto: UpdateSaleDto, actorId?: string) {
    const sale = await this.getOrThrow(id);
    const finalPrice =
      dto.negotiatedPrice !== undefined || dto.discount !== undefined
        ? this.computeFinal({
            announcedPrice: dec(sale.announcedPrice),
            negotiatedPrice: dto.negotiatedPrice ?? dec(sale.negotiatedPrice),
            discount: dto.discount ?? dec(sale.discount),
          })
        : undefined;

    const updated = await this.prisma.vehicleSale.update({
      where: { id },
      data: {
        negotiatedPrice: dto.negotiatedPrice,
        discount: dto.discount,
        finalPrice,
        paymentMethod: dto.paymentMethod,
        downPayment: dto.downPayment,
        installments: dto.installments,
        financing: dto.financing,
        financialInstitution: dto.financialInstitution,
        tradeInVehicleId: dto.tradeInVehicleId,
        deliveryForecast: dto.deliveryForecast
          ? new Date(dto.deliveryForecast)
          : undefined,
        notes: dto.notes,
      },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'VehicleSale',
      entityId: id,
      before: sale,
      after: updated,
    });
    return updated;
  }

  async updateStatus(id: string, dto: UpdateSaleStatusDto, actorId?: string) {
    const sale = await this.getOrThrow(id);

    if (dto.status === 'COMPLETED') {
      return this.complete(sale.id, dto.finalPrice, dto.notes, actorId);
    }

    if (dto.status === 'CANCELED') {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: sale.vehicleId },
      });
      if (
        vehicle &&
        this.stock.isTransitionAllowed(vehicle.status, 'AVAILABLE')
      ) {
        await this.stock.changeStatus(
          sale.vehicleId,
          'AVAILABLE',
          { reason: 'sale_canceled' },
          actorId,
        );
      }
    }

    const updated = await this.prisma.vehicleSale.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes ?? sale.notes },
    });
    await this.audit.log({
      actorId,
      action: 'STATUS_CHANGE',
      entity: 'VehicleSale',
      entityId: id,
      before: { status: sale.status },
      after: { status: dto.status },
    });
    return updated;
  }

  private async complete(
    id: string,
    finalPriceOverride: number | undefined,
    notes: string | undefined,
    actorId?: string,
  ) {
    const sale = await this.getOrThrow(id);
    const finalPrice = finalPriceOverride ?? dec(sale.finalPrice);
    if (!finalPrice) {
      throw new AppException(
        'VALIDATION_ERROR',
        'finalPrice é obrigatório para concluir a venda.',
      );
    }

    const updated = await this.prisma.vehicleSale.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalPrice,
        saleDate: new Date(),
        notes: notes ?? sale.notes,
      },
    });

    // Mark the vehicle sold.
    await this.prisma.vehicle.update({
      where: { id: sale.vehicleId },
      data: { soldPrice: finalPrice, soldAt: new Date() },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: sale.vehicleId },
    });
    if (vehicle && this.stock.isTransitionAllowed(vehicle.status, 'SOLD')) {
      await this.stock.changeStatus(
        sale.vehicleId,
        'SOLD',
        { reason: 'sale_completed', type: 'SALE' },
        actorId,
      );
    }

    // Revenue entry.
    await this.financial.addAutomaticEntry({
      vehicleId: sale.vehicleId,
      nature: 'REVENUE',
      category: FINANCIAL_CATEGORIES.SALE,
      amount: finalPrice,
      description: 'Venda do veículo',
      sourceModule: 'sale',
      externalRef: sale.id,
      responsibleId: actorId,
    });

    // Generate commission.
    await this.commissions.generateForSale(updated, actorId);

    await this.audit.log({
      actorId,
      action: 'STATUS_CHANGE',
      entity: 'VehicleSale',
      entityId: id,
      after: { status: 'COMPLETED', finalPrice },
    });

    this.realtime.emit(
      EVENTS.SALE_COMPLETED,
      { id: sale.id, vehicleId: sale.vehicleId, finalPrice },
      { roles: ['ADMIN'], sellerId: sale.sellerId },
    );

    return updated;
  }

  async markDelivered(id: string, actorId?: string) {
    const sale = await this.getOrThrow(id);
    const updated = await this.prisma.vehicleSale.update({
      where: { id },
      data: { deliveredAt: new Date() },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: sale.vehicleId },
    });
    if (
      vehicle &&
      this.stock.isTransitionAllowed(vehicle.status, 'DELIVERED')
    ) {
      await this.stock.changeStatus(
        sale.vehicleId,
        'DELIVERED',
        { reason: 'delivered' },
        actorId,
      );
    }
    return updated;
  }

  private async getOrThrow(id: string) {
    const sale = await this.prisma.vehicleSale.findUnique({ where: { id } });
    if (!sale) throw new AppException('SALE_NOT_FOUND');
    return sale;
  }

  async findOne(
    id: string,
    user?: { role: string; employeeId?: string | null },
  ) {
    const sale = await this.prisma.vehicleSale.findUnique({
      where: { id },
      include: {
        vehicle: { select: { brand: true, model: true, modelYear: true } },
        customer: { select: { fullName: true } },
        commission: true,
      },
    });
    if (!sale) throw new AppException('SALE_NOT_FOUND');
    if (user?.role === 'SELLER' && sale.sellerId !== user.employeeId) {
      throw new AppException('FORBIDDEN');
    }
    return sale;
  }

  async findAll(
    pg: PaginationQueryDto,
    filters: { sellerId?: string; status?: string; from?: Date; to?: Date },
  ) {
    const where: Prisma.VehicleSaleWhereInput = {
      sellerId: filters.sellerId,
      status: filters.status as any,
      saleDate:
        filters.from || filters.to
          ? { gte: filters.from, lte: filters.to }
          : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicleSale.findMany({
        where,
        include: {
          vehicle: { select: { brand: true, model: true } },
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.vehicleSale.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }
}
