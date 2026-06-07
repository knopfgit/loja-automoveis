import { Injectable } from '@nestjs/common';
import { AcquisitionType, VehicleOrigin } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { FinancialService } from '../financial/financial.service';
import { FINANCIAL_CATEGORIES } from '../financial/financial.constants';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateAcquisitionDto } from './dto/commercial.dto';

const ORIGIN_MAP: Record<AcquisitionType, VehicleOrigin> = {
  OWN_PURCHASE: 'OWN_PURCHASE',
  CONSIGNMENT: 'CONSIGNMENT',
  TRADE_IN: 'TRADE_IN',
};

@Injectable()
export class AcquisitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly financial: FinancialService,
  ) {}

  async create(dto: CreateAcquisitionDto, actorId?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new AppException('VEHICLE_NOT_FOUND');

    const confirmed = dto.confirm !== false;
    const type = dto.type ?? 'OWN_PURCHASE';

    const acquisition = await this.prisma.vehicleAcquisition.upsert({
      where: { vehicleId: dto.vehicleId },
      create: {
        vehicleId: dto.vehicleId,
        type,
        sellerName: dto.sellerName,
        sellerDocument: dto.sellerDocument,
        purchasePrice: dto.purchasePrice,
        purchaseDate: new Date(dto.purchaseDate),
        paymentMethod: dto.paymentMethod,
        installments: dto.installments,
        additionalCosts: dto.additionalCosts,
        responsibleId: actorId,
        notes: dto.notes,
        status: confirmed ? 'CONFIRMED' : 'DRAFT',
      },
      update: {
        type,
        sellerName: dto.sellerName,
        sellerDocument: dto.sellerDocument,
        purchasePrice: dto.purchasePrice,
        purchaseDate: new Date(dto.purchaseDate),
        paymentMethod: dto.paymentMethod,
        installments: dto.installments,
        additionalCosts: dto.additionalCosts,
        notes: dto.notes,
        status: confirmed ? 'CONFIRMED' : 'DRAFT',
      },
    });

    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: { purchasePrice: dto.purchasePrice, origin: ORIGIN_MAP[type] },
    });

    if (confirmed) {
      await this.financial.addAutomaticEntry({
        vehicleId: dto.vehicleId,
        nature: 'EXPENSE',
        category: FINANCIAL_CATEGORIES.PURCHASE,
        amount: dto.purchasePrice,
        description: 'Compra do veículo',
        sourceModule: 'acquisition',
        externalRef: acquisition.id,
        responsibleId: actorId,
      });
      if (dto.additionalCosts && dto.additionalCosts > 0) {
        await this.financial.addAutomaticEntry({
          vehicleId: dto.vehicleId,
          nature: 'EXPENSE',
          category: 'Transporte',
          amount: dto.additionalCosts,
          description: 'Custos adicionais da aquisição',
          sourceModule: 'acquisition',
          externalRef: `${acquisition.id}-extra`,
          responsibleId: actorId,
        });
      }
    }

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'VehicleAcquisition',
      entityId: acquisition.id,
      after: { purchasePrice: dto.purchasePrice, confirmed },
    });

    return acquisition;
  }

  async findOne(vehicleId: string) {
    const acquisition = await this.prisma.vehicleAcquisition.findUnique({
      where: { vehicleId },
    });
    if (!acquisition)
      throw new AppException('NOT_FOUND', 'Aquisição não encontrada.');
    return acquisition;
  }

  async findAll(pg: PaginationQueryDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicleAcquisition.findMany({
        include: {
          vehicle: { select: { brand: true, model: true, modelYear: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.vehicleAcquisition.count(),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }
}
