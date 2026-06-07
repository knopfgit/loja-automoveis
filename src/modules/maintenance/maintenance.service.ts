import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PartsService } from '../parts/parts.service';
import { FinancialService } from '../financial/financial.service';
import { FINANCIAL_CATEGORIES } from '../financial/financial.constants';
import {
  AddMaintenancePartDto,
  CompleteMaintenanceDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly parts: PartsService,
    private readonly financial: FinancialService,
  ) {}

  async create(dto: CreateMaintenanceDto, actorId?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    const maintenance = await this.prisma.maintenance.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type,
        description: dto.description,
        workshop: dto.workshop,
        supplierId: dto.supplierId,
        forecastDate: dto.forecastDate ? new Date(dto.forecastDate) : undefined,
        mileage: dto.mileage,
        laborCost: dto.laborCost ?? 0,
        totalCost: dto.laborCost ?? 0,
        invoiceNumber: dto.invoiceNumber,
        warranty: dto.warranty,
        notes: dto.notes,
        responsibleId: actorId,
      },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Maintenance',
      entityId: maintenance.id,
      after: { vehicleId: dto.vehicleId, type: dto.type },
    });

    this.realtime.emit(
      EVENTS.MAINTENANCE_CREATED,
      { id: maintenance.id, vehicleId: dto.vehicleId },
      { roles: ['ADMIN'] },
    );
    return maintenance;
  }

  async findAll(pg: PaginationQueryDto, vehicleId?: string, status?: string) {
    const where: Prisma.MaintenanceWhereInput = {
      vehicleId,
      status: status as any,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.maintenance.findMany({
        where,
        include: { parts: true, supplier: true },
        orderBy: { openedAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.maintenance.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
      include: {
        parts: { include: { part: true } },
        supplier: true,
        vehicle: true,
      },
    });
    if (!maintenance) throw new AppException('MAINTENANCE_NOT_FOUND');
    return maintenance;
  }

  async update(id: string, dto: UpdateMaintenanceDto, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        type: dto.type,
        description: dto.description,
        workshop: dto.workshop,
        supplierId: dto.supplierId,
        forecastDate: dto.forecastDate ? new Date(dto.forecastDate) : undefined,
        mileage: dto.mileage,
        invoiceNumber: dto.invoiceNumber,
        warranty: dto.warranty,
        notes: dto.notes,
      },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Maintenance',
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  }

  /**
   * Apply a part to the maintenance: decrements stock, records cost in the
   * vehicle history and DRE, and updates the maintenance totals.
   */
  async addPart(id: string, dto: AddMaintenancePartDto, actorId?: string) {
    const maintenance = await this.findOne(id);
    if (
      maintenance.status === 'COMPLETED' ||
      maintenance.status === 'CANCELED'
    ) {
      throw new AppException(
        'CONFLICT',
        'Não é possível adicionar peças a uma manutenção finalizada/cancelada.',
      );
    }

    const { unitCost, totalCost } = await this.parts.consumeForMaintenance(
      dto.partId,
      dto.quantity,
      id,
      maintenance.vehicleId,
      actorId,
    );

    const maintenancePart = await this.prisma.maintenancePart.create({
      data: {
        maintenanceId: id,
        partId: dto.partId,
        quantity: dto.quantity,
        unitCost,
        totalCost,
      },
    });

    // Post the part cost to the vehicle DRE.
    await this.financial.addAutomaticEntry({
      vehicleId: maintenance.vehicleId,
      nature: 'EXPENSE',
      category: FINANCIAL_CATEGORIES.PARTS,
      amount: totalCost,
      description: `Peça aplicada na manutenção ${id}`,
      sourceModule: 'parts',
      externalRef: maintenancePart.id,
      responsibleId: actorId,
    });

    await this.recomputeCosts(id);
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Maintenance',
      entityId: id,
      reason: 'part_added',
      after: { partId: dto.partId, quantity: dto.quantity, totalCost },
    });
    return maintenancePart;
  }

  /** Reverse a previously applied part (returns stock, removes cost). */
  async removePart(id: string, maintenancePartId: string, actorId?: string) {
    const maintenance = await this.findOne(id);
    const mp = await this.prisma.maintenancePart.findFirst({
      where: { id: maintenancePartId, maintenanceId: id },
    });
    if (!mp)
      throw new AppException('NOT_FOUND', 'Item de peça não encontrado.');
    if (mp.reversed) throw new AppException('CONFLICT', 'Item já estornado.');

    await this.parts.reverseMaintenanceConsumption(
      mp.partId,
      mp.quantity,
      id,
      actorId,
    );
    await this.financial.removeBySourceRef(
      'parts',
      mp.id,
      maintenance.vehicleId,
    );
    await this.prisma.maintenancePart.update({
      where: { id: mp.id },
      data: { reversed: true },
    });
    await this.recomputeCosts(id);
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Maintenance',
      entityId: id,
      reason: 'part_reversed',
      after: { maintenancePartId },
    });
    return { success: true };
  }

  private async recomputeCosts(id: string) {
    const parts = await this.prisma.maintenancePart.findMany({
      where: { maintenanceId: id, reversed: false },
    });
    const partsCost = parts.reduce((acc, p) => acc + Number(p.totalCost), 0);
    const m = await this.prisma.maintenance.findUnique({ where: { id } });
    const laborCost = Number(m?.laborCost ?? 0);
    await this.prisma.maintenance.update({
      where: { id },
      data: { partsCost, totalCost: partsCost + laborCost },
    });
  }

  async complete(id: string, dto: CompleteMaintenanceDto, actorId?: string) {
    const maintenance = await this.findOne(id);
    if (maintenance.status === 'COMPLETED') {
      throw new AppException('CONFLICT', 'Manutenção já finalizada.');
    }

    const laborCost = dto.laborCost ?? Number(maintenance.laborCost);

    await this.prisma.maintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        laborCost,
        nextRevisionDate: dto.nextRevisionDate
          ? new Date(dto.nextRevisionDate)
          : undefined,
        nextRevisionMileage: dto.nextRevisionMileage,
        notes: dto.notes ?? maintenance.notes,
      },
    });

    // Post labor cost (parts already posted as they were applied).
    if (laborCost > 0) {
      await this.financial.addAutomaticEntry({
        vehicleId: maintenance.vehicleId,
        nature: 'EXPENSE',
        category: FINANCIAL_CATEGORIES.LABOR,
        amount: laborCost,
        description: `Mão de obra - manutenção ${id}`,
        sourceModule: 'maintenance',
        externalRef: id,
        responsibleId: actorId,
      });
    }

    await this.recomputeCosts(id);

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Maintenance',
      entityId: id,
      reason: 'completed',
      after: { laborCost },
    });

    this.realtime.emit(
      EVENTS.MAINTENANCE_COMPLETED,
      { id, vehicleId: maintenance.vehicleId },
      { roles: ['ADMIN'] },
    );

    return this.findOne(id);
  }

  async cancel(id: string, actorId?: string) {
    const maintenance = await this.findOne(id);
    // Reverse any applied parts.
    for (const mp of maintenance.parts) {
      if (!mp.reversed) {
        await this.parts.reverseMaintenanceConsumption(
          mp.partId,
          mp.quantity,
          id,
          actorId,
        );
        await this.financial.removeBySourceRef(
          'parts',
          mp.id,
          maintenance.vehicleId,
        );
        await this.prisma.maintenancePart.update({
          where: { id: mp.id },
          data: { reversed: true },
        });
      }
    }
    await this.prisma.maintenance.update({
      where: { id },
      data: { status: 'CANCELED' },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Maintenance',
      entityId: id,
      reason: 'canceled',
    });
    return { success: true };
  }
}
