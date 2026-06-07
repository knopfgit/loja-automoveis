import { Injectable } from '@nestjs/common';
import { PartMovementType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreatePartDto, PartMovementDto, UpdatePartDto } from './dto/part.dto';

// Movement types that increase stock vs decrease stock.
const INCREASE: PartMovementType[] = [
  'ENTRY',
  'RETURN',
  'CANCEL_RESERVE',
  'REVERSAL',
];
const DECREASE: PartMovementType[] = [
  'EXIT',
  'RESERVE',
  'APPLY_TO_VEHICLE',
  'LOSS',
];

@Injectable()
export class PartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreatePartDto, actorId?: string) {
    const part = await this.prisma.part.create({
      data: {
        internalCode: dto.internalCode,
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        compatibleModel: dto.compatibleModel,
        description: dto.description,
        quantity: dto.quantity ?? 0,
        minQuantity: dto.minQuantity ?? 0,
        unit: dto.unit ?? 'UN',
        costPrice: dto.costPrice ?? 0,
        averagePrice: dto.costPrice ?? 0,
        location: dto.location,
        supplierId: dto.supplierId,
        notes: dto.notes,
      },
    });
    // Record initial stock as an ENTRY movement.
    if ((dto.quantity ?? 0) > 0) {
      await this.prisma.partStockMovement.create({
        data: {
          partId: part.id,
          type: 'ENTRY',
          quantity: dto.quantity ?? 0,
          unitCost: dto.costPrice ?? 0,
          totalCost: (dto.costPrice ?? 0) * (dto.quantity ?? 0),
          reason: 'initial_stock',
          performedById: actorId,
        },
      });
    }
    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Part',
      entityId: part.id,
      after: { name: part.name, quantity: part.quantity },
    });
    return part;
  }

  async findAll(pg: PaginationQueryDto, search?: string, lowStock?: boolean) {
    const where: Prisma.PartWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { internalCode: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    let items: any[];
    let total: number;
    if (lowStock) {
      // Prisma can't compare two columns in a filter; do it in memory.
      const all = await this.prisma.part.findMany({ where });
      const filtered = all.filter((p) => p.quantity <= p.minQuantity);
      total = filtered.length;
      items = filtered.slice(pg.skip, pg.skip + pg.limit);
    } else {
      [items, total] = await this.prisma.$transaction([
        this.prisma.part.findMany({
          where,
          include: { supplier: true },
          orderBy: { createdAt: 'desc' },
          skip: pg.skip,
          take: pg.limit,
        }),
        this.prisma.part.count({ where }),
      ]);
    }
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!part) throw new AppException('PART_NOT_FOUND');
    return part;
  }

  async update(id: string, dto: UpdatePartDto, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.part.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Part',
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  }

  /**
   * Generic stock movement. Validates sufficient stock for decreases and keeps
   * a weighted-average cost up to date on entries.
   */
  async move(id: string, dto: PartMovementDto, actorId?: string) {
    const part = await this.findOne(id);

    let delta = 0;
    if (INCREASE.includes(dto.type)) delta = Math.abs(dto.quantity);
    else if (DECREASE.includes(dto.type)) delta = -Math.abs(dto.quantity);
    else if (dto.type === 'ADJUSTMENT') delta = dto.quantity; // signed

    const newQty = part.quantity + delta;
    if (newQty < 0) throw new AppException('PART_INSUFFICIENT_STOCK');

    // Weighted average cost on entries.
    let averagePrice = Number(part.averagePrice);
    if (dto.type === 'ENTRY' && dto.unitCost !== undefined) {
      const oldValue = Number(part.averagePrice) * part.quantity;
      const inValue = dto.unitCost * Math.abs(dto.quantity);
      averagePrice = newQty > 0 ? (oldValue + inValue) / newQty : dto.unitCost;
    }

    const unitCost = dto.unitCost ?? Number(part.averagePrice);
    const [updated] = await this.prisma.$transaction([
      this.prisma.part.update({
        where: { id },
        data: {
          quantity: newQty,
          averagePrice,
          costPrice:
            dto.type === 'ENTRY' && dto.unitCost !== undefined
              ? dto.unitCost
              : part.costPrice,
        },
      }),
      this.prisma.partStockMovement.create({
        data: {
          partId: id,
          type: dto.type,
          quantity: Math.abs(dto.quantity),
          unitCost,
          totalCost: unitCost * Math.abs(dto.quantity),
          vehicleId: dto.vehicleId,
          reason: dto.reason,
          notes: dto.notes,
          performedById: actorId,
        },
      }),
    ]);

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Part',
      entityId: id,
      reason: `movement_${dto.type}`,
      before: { quantity: part.quantity },
      after: { quantity: newQty },
    });

    await this.checkLowStock(updated.id);
    return updated;
  }

  /**
   * Consume a part for a maintenance (decrements stock, records movement).
   * Returns the unit/total cost actually applied. Used by MaintenanceService.
   */
  async consumeForMaintenance(
    partId: string,
    quantity: number,
    maintenanceId: string,
    vehicleId: string,
    actorId?: string,
  ): Promise<{ unitCost: number; totalCost: number }> {
    const part = await this.findOne(partId);
    if (part.quantity < quantity) {
      throw new AppException('PART_INSUFFICIENT_STOCK');
    }
    const unitCost = Number(part.averagePrice) || Number(part.costPrice);
    const totalCost = unitCost * quantity;

    await this.prisma.$transaction([
      this.prisma.part.update({
        where: { id: partId },
        data: { quantity: { decrement: quantity } },
      }),
      this.prisma.partStockMovement.create({
        data: {
          partId,
          type: 'APPLY_TO_VEHICLE',
          quantity,
          unitCost,
          totalCost,
          vehicleId,
          maintenanceId,
          reason: 'applied_in_maintenance',
          performedById: actorId,
        },
      }),
    ]);

    await this.checkLowStock(partId);
    return { unitCost, totalCost };
  }

  /** Reverse a maintenance consumption (returns stock). */
  async reverseMaintenanceConsumption(
    partId: string,
    quantity: number,
    maintenanceId: string,
    actorId?: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.part.update({
        where: { id: partId },
        data: { quantity: { increment: quantity } },
      }),
      this.prisma.partStockMovement.create({
        data: {
          partId,
          type: 'REVERSAL',
          quantity,
          maintenanceId,
          reason: 'maintenance_part_reversed',
          performedById: actorId,
        },
      }),
    ]);
  }

  private async checkLowStock(partId: string) {
    const part = await this.prisma.part.findUnique({ where: { id: partId } });
    if (!part) return;
    if (part.quantity <= part.minQuantity) {
      this.realtime.emit(
        EVENTS.PART_STOCK_LOW,
        {
          partId: part.id,
          name: part.name,
          quantity: part.quantity,
          minQuantity: part.minQuantity,
        },
        { roles: ['ADMIN'] },
      );
      // Notify all admins in-app.
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, status: 'ACTIVE' },
        select: { id: true, email: true },
      });
      for (const admin of admins) {
        await this.notifications.create({
          userId: admin.id,
          type: EVENTS.PART_STOCK_LOW,
          title: 'Estoque mínimo de peça atingido',
          body: `${part.name}: ${part.quantity}/${part.minQuantity}`,
          data: { partId: part.id },
          email: {
            to: admin.email,
            template: 'part-stock-low',
            context: {
              partName: part.name,
              quantity: part.quantity,
              minQuantity: part.minQuantity,
            },
          },
        });
      }
    }
  }

  async listMovements(partId: string, page: number, limit: number) {
    const where = { partId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.partStockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.partStockMovement.count({ where }),
    ]);
    return PaginatedResult.of(items, total, page, limit);
  }

  async lowStockList() {
    const all = await this.prisma.part.findMany({
      where: { status: 'ACTIVE' },
    });
    return all.filter((p) => p.quantity <= p.minQuantity);
  }
}
