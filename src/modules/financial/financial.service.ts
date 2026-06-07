import { Injectable } from '@nestjs/common';
import { FinancialNature, FinancialOrigin, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { DreService } from './dre.service';

export interface AutoEntryInput {
  vehicleId: string;
  nature: FinancialNature;
  category: string;
  amount: number;
  description?: string;
  sourceModule: string;
  externalRef?: string;
  responsibleId?: string;
}

export interface ManualEntryInput {
  vehicleId?: string;
  nature: FinancialNature;
  category: string;
  amount: number;
  description?: string;
  date?: string;
  notes?: string;
  documentId?: string;
}

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dre: DreService,
    private readonly audit: AuditService,
  ) {}

  /** Automatic posting from other modules (maintenance, parts, sale...). */
  async addAutomaticEntry(input: AutoEntryInput) {
    const entry = await this.prisma.financialEntry.create({
      data: {
        vehicleId: input.vehicleId,
        nature: input.nature,
        category: input.category,
        amount: input.amount,
        description: input.description,
        origin: FinancialOrigin.AUTOMATIC,
        sourceModule: input.sourceModule,
        externalRef: input.externalRef,
        responsibleId: input.responsibleId,
      },
    });
    await this.dre.recalculate(input.vehicleId);
    return entry;
  }

  /** Remove all automatic entries for a given source reference (e.g. reversal). */
  async removeBySourceRef(
    sourceModule: string,
    externalRef: string,
    vehicleId?: string,
  ) {
    const where: Prisma.FinancialEntryWhereInput = {
      sourceModule,
      externalRef,
    };
    const removed = await this.prisma.financialEntry.deleteMany({ where });
    if (vehicleId) await this.dre.recalculate(vehicleId);
    return removed;
  }

  async createManual(input: ManualEntryInput, actorId?: string) {
    const entry = await this.prisma.financialEntry.create({
      data: {
        vehicleId: input.vehicleId,
        nature: input.nature,
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date ? new Date(input.date) : undefined,
        notes: input.notes,
        documentId: input.documentId,
        origin: FinancialOrigin.MANUAL,
        sourceModule: 'manual',
        responsibleId: actorId,
      },
    });
    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'FinancialEntry',
      entityId: entry.id,
      after: {
        nature: input.nature,
        category: input.category,
        amount: input.amount,
      },
    });
    if (input.vehicleId) await this.dre.recalculate(input.vehicleId);
    return entry;
  }

  async remove(id: string, actorId?: string) {
    const entry = await this.prisma.financialEntry.findUnique({
      where: { id },
    });
    if (!entry) return { success: true };
    await this.prisma.financialEntry.delete({ where: { id } });
    await this.audit.log({
      actorId,
      action: 'DELETE',
      entity: 'FinancialEntry',
      entityId: id,
      before: entry,
    });
    if (entry.vehicleId) await this.dre.recalculate(entry.vehicleId);
    return { success: true };
  }

  async listByVehicle(vehicleId: string, page: number, limit: number) {
    const where = { vehicleId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.financialEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.financialEntry.count({ where }),
    ]);
    return PaginatedResult.of(items, total, page, limit);
  }
}
