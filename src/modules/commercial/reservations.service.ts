import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { StockService } from '../vehicles/stock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateReservationDto } from './dto/commercial.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly stock: StockService,
  ) {}

  async create(dto: CreateReservationDto, actorId?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    const days =
      dto.durationDays ??
      this.config.get<number>('business.reservationDefaultDays', 3);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const reservation = await this.prisma.vehicleReservation.create({
      data: {
        vehicleId: dto.vehicleId,
        customerId: dto.customerId,
        sellerId: dto.sellerId,
        expiresAt,
        depositAmount: dto.depositAmount,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });

    await this.stock.changeStatus(
      dto.vehicleId,
      'RESERVED',
      { reason: 'reservation_created', type: 'RESERVE' },
      actorId,
    );

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'VehicleReservation',
      entityId: reservation.id,
      after: {
        vehicleId: dto.vehicleId,
        customerId: dto.customerId,
        expiresAt,
      },
    });
    return reservation;
  }

  async cancel(id: string, reason?: string, actorId?: string) {
    const reservation = await this.prisma.vehicleReservation.findUnique({
      where: { id },
    });
    if (!reservation) throw new AppException('RESERVATION_NOT_FOUND');

    await this.prisma.vehicleReservation.update({
      where: { id },
      data: { status: 'CANCELED', cancelReason: reason },
    });
    // Return vehicle to available (best-effort: only if still reserved).
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: reservation.vehicleId },
    });
    if (vehicle?.status === 'RESERVED') {
      await this.stock.changeStatus(
        reservation.vehicleId,
        'AVAILABLE',
        { reason: 'reservation_canceled', type: 'CANCEL_RESERVE' },
        actorId,
      );
    }
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'VehicleReservation',
      entityId: id,
      reason: reason ?? 'canceled',
    });
    return { id, status: 'CANCELED' };
  }

  async findAll(
    pg: PaginationQueryDto,
    filters: { status?: string; sellerId?: string; customerId?: string },
  ) {
    const where: Prisma.VehicleReservationWhereInput = {
      status: filters.status as any,
      sellerId: filters.sellerId,
      customerId: filters.customerId,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicleReservation.findMany({
        where,
        include: {
          vehicle: { select: { brand: true, model: true, modelYear: true } },
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.vehicleReservation.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }
}
