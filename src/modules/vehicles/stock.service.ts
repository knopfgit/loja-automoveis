import { Injectable } from '@nestjs/common';
import { StockMovementType, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';

/**
 * Allowed status transitions. Kept intentionally permissive between operational
 * states but blocks nonsensical jumps (e.g. ARCHIVED -> SOLD).
 */
const TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  DRAFT: [
    'AWAITING_INSPECTION',
    'AWAITING_DOCUMENTS',
    'IN_MAINTENANCE',
    'AVAILABLE',
    'ARCHIVED',
  ],
  AWAITING_INSPECTION: [
    'AWAITING_DOCUMENTS',
    'IN_MAINTENANCE',
    'AVAILABLE',
    'ARCHIVED',
  ],
  AWAITING_DOCUMENTS: ['IN_MAINTENANCE', 'AVAILABLE', 'ARCHIVED'],
  IN_MAINTENANCE: ['AWAITING_DOCUMENTS', 'AVAILABLE', 'ARCHIVED'],
  AVAILABLE: [
    'RESERVED',
    'NEGOTIATING',
    'IN_MAINTENANCE',
    'CONSIGNED',
    'SOLD',
    'ARCHIVED',
  ],
  RESERVED: ['AVAILABLE', 'NEGOTIATING', 'SOLD', 'ARCHIVED'],
  NEGOTIATING: ['AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED'],
  SOLD: ['DELIVERED', 'AVAILABLE', 'ARCHIVED'],
  DELIVERED: ['ARCHIVED'],
  CONSIGNED: ['AVAILABLE', 'SOLD', 'ARCHIVED'],
  ARCHIVED: ['AVAILABLE', 'DRAFT'],
};

const STATUS_TO_MOVEMENT: Partial<Record<VehicleStatus, StockMovementType>> = {
  AVAILABLE: StockMovementType.ENTRY,
  RESERVED: StockMovementType.RESERVE,
  SOLD: StockMovementType.SALE,
  CONSIGNED: StockMovementType.CONSIGNMENT,
  ARCHIVED: StockMovementType.ARCHIVE,
};

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
  ) {}

  isTransitionAllowed(from: VehicleStatus, to: VehicleStatus): boolean {
    if (from === to) return true;
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  async changeStatus(
    vehicleId: string,
    toStatus: VehicleStatus,
    opts: { reason?: string; notes?: string; type?: StockMovementType },
    actorId?: string,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    if (!this.isTransitionAllowed(vehicle.status, toStatus)) {
      throw new AppException(
        'VEHICLE_INVALID_STATUS_TRANSITION',
        `Não é possível mudar de ${vehicle.status} para ${toStatus}.`,
      );
    }

    const fromStatus = vehicle.status;
    const movementType =
      opts.type ?? STATUS_TO_MOVEMENT[toStatus] ?? StockMovementType.EXIT;

    const [updated] = await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: toStatus,
          archiveReason:
            toStatus === 'ARCHIVED' ? opts.reason : vehicle.archiveReason,
          soldAt: toStatus === 'SOLD' ? new Date() : vehicle.soldAt,
        },
      }),
      this.prisma.vehicleStockMovement.create({
        data: {
          vehicleId,
          type: movementType,
          fromStatus,
          toStatus,
          reason: opts.reason,
          notes: opts.notes,
          performedById: actorId,
        },
      }),
    ]);

    await this.audit.log({
      actorId,
      action: 'STATUS_CHANGE',
      entity: 'Vehicle',
      entityId: vehicleId,
      before: { status: fromStatus },
      after: { status: toStatus },
      reason: opts.reason,
    });

    this.realtime.emit(
      EVENTS.VEHICLE_STATUS_CHANGED,
      { vehicleId, fromStatus, toStatus },
      { roles: ['ADMIN', 'SELLER'] },
    );

    return updated;
  }

  async listMovements(vehicleId: string, page: number, limit: number) {
    const where = { vehicleId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicleStockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicleStockMovement.count({ where }),
    ]);
    return PaginatedResult.of(items, total, page, limit);
  }
}
