import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { StorageService } from '../../storage/storage.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ChecklistStatusQueryDto,
  CreateDocumentDto,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  UpsertChecklistDto,
  ValidateDocumentDto,
} from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly storage: StorageService,
  ) {}

  // ----------------------------------------------------------- types
  listTypes(ownerType?: string) {
    return this.prisma.documentType.findMany({
      where: { ownerType: ownerType as any },
      orderBy: { name: 'asc' },
    });
  }

  createType(dto: CreateDocumentTypeDto) {
    return this.prisma.documentType.create({ data: dto });
  }

  async updateType(id: string, dto: UpdateDocumentTypeDto) {
    const type = await this.prisma.documentType.findUnique({ where: { id } });
    if (!type)
      throw new AppException('NOT_FOUND', 'Tipo de documento não encontrado.');
    return this.prisma.documentType.update({ where: { id }, data: dto });
  }

  // ----------------------------------------------------------- checklists
  listChecklists(stage?: string) {
    return this.prisma.documentChecklist.findMany({
      where: { stage: stage as any, active: true },
      include: { documentType: true },
      orderBy: [{ stage: 'asc' }, { position: 'asc' }],
    });
  }

  upsertChecklist(dto: UpsertChecklistDto) {
    return this.prisma.documentChecklist.upsert({
      where: {
        stage_documentTypeId: {
          stage: dto.stage,
          documentTypeId: dto.documentTypeId,
        },
      },
      create: {
        stage: dto.stage,
        documentTypeId: dto.documentTypeId,
        required: dto.required ?? true,
        position: dto.position ?? 0,
      },
      update: {
        required: dto.required,
        position: dto.position,
        active: true,
      },
    });
  }

  async removeChecklist(id: string) {
    await this.prisma.documentChecklist.update({
      where: { id },
      data: { active: false },
    });
    return { success: true };
  }

  // ----------------------------------------------------------- documents
  async create(dto: CreateDocumentDto, actorId?: string) {
    const doc = await this.prisma.document.create({
      data: {
        documentTypeId: dto.documentTypeId,
        ownerType: dto.ownerType,
        vehicleId: dto.vehicleId,
        customerId: dto.customerId,
        saleId: dto.saleId,
        status: dto.status ?? 'PENDING_REQUEST',
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        notes: dto.notes,
        responsibleId: actorId,
      },
    });
    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Document',
      entityId: doc.id,
      after: { documentTypeId: dto.documentTypeId, status: doc.status },
    });
    if (
      doc.status?.startsWith('AWAITING') ||
      doc.status === 'PENDING_REQUEST'
    ) {
      this.realtime.emit(
        EVENTS.DOCUMENT_PENDING,
        { documentId: doc.id, vehicleId: doc.vehicleId },
        { roles: ['ADMIN', 'SELLER'] },
      );
    }
    return doc;
  }

  async upload(
    documentId: string | undefined,
    file: Express.Multer.File,
    meta: Partial<CreateDocumentDto>,
    actorId?: string,
  ) {
    if (!file) throw new AppException('VALIDATION_ERROR', 'Arquivo ausente.');
    const stored = await this.storage.save(file, 'documents');

    let doc;
    if (documentId) {
      doc = await this.prisma.document.findUnique({
        where: { id: documentId },
      });
      if (!doc) throw new AppException('DOCUMENT_NOT_FOUND');
    } else {
      if (!meta.documentTypeId || !meta.ownerType) {
        throw new AppException(
          'VALIDATION_ERROR',
          'documentTypeId e ownerType são obrigatórios.',
        );
      }
      doc = await this.prisma.document.create({
        data: {
          documentTypeId: meta.documentTypeId,
          ownerType: meta.ownerType,
          vehicleId: meta.vehicleId,
          customerId: meta.customerId,
          saleId: meta.saleId,
          status: 'RECEIVED',
          responsibleId: actorId,
        },
      });
    }

    // Determine next version number.
    const versionsCount = await this.prisma.documentVersion.count({
      where: { documentId: doc.id },
    });

    const [updated] = await this.prisma.$transaction([
      this.prisma.document.update({
        where: { id: doc.id },
        data: {
          fileUrl: stored.url,
          storageKey: stored.key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          status: 'UNDER_REVIEW',
          uploadedAt: new Date(),
          issueDate: meta.issueDate ? new Date(meta.issueDate) : undefined,
          expiryDate: meta.expiryDate ? new Date(meta.expiryDate) : undefined,
        },
      }),
      this.prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          version: versionsCount + 1,
          fileUrl: stored.url,
          storageKey: stored.key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedById: actorId,
        },
      }),
    ]);

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Document',
      entityId: doc.id,
      reason: 'uploaded',
      after: { status: 'UNDER_REVIEW', version: versionsCount + 1 },
    });
    return updated;
  }

  async validate(id: string, dto: ValidateDocumentDto, actorId?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new AppException('DOCUMENT_NOT_FOUND');

    const status =
      dto.status === 'APPROVED'
        ? DocumentStatus.APPROVED
        : DocumentStatus.REJECTED;

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        status,
        validatedAt: new Date(),
        validatedById: actorId,
        rejectionReason: status === 'REJECTED' ? dto.rejectionReason : null,
      },
    });
    await this.audit.log({
      actorId,
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      entity: 'Document',
      entityId: id,
      after: { status, rejectionReason: dto.rejectionReason },
    });
    return updated;
  }

  async findMany(
    pg: PaginationQueryDto,
    filters: {
      vehicleId?: string;
      customerId?: string;
      saleId?: string;
      status?: string;
    },
  ) {
    const where: Prisma.DocumentWhereInput = {
      vehicleId: filters.vehicleId,
      customerId: filters.customerId,
      saleId: filters.saleId,
      status: filters.status as any,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        include: { documentType: true },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.document.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { documentType: true, versions: true },
    });
    if (!doc) throw new AppException('DOCUMENT_NOT_FOUND');
    return doc;
  }

  /**
   * Checklist status for a stage: for each configured (and required) document
   * type, find a matching document and report whether it is satisfied.
   */
  async checklistStatus(query: ChecklistStatusQueryDto) {
    const checklist = await this.prisma.documentChecklist.findMany({
      where: { stage: query.stage, active: true },
      include: { documentType: true },
      orderBy: { position: 'asc' },
    });

    const docs = await this.prisma.document.findMany({
      where: {
        OR: [
          query.vehicleId ? { vehicleId: query.vehicleId } : undefined,
          query.customerId ? { customerId: query.customerId } : undefined,
          query.saleId ? { saleId: query.saleId } : undefined,
        ].filter(Boolean) as Prisma.DocumentWhereInput[],
      },
    });

    const items = checklist.map((c) => {
      const doc = docs.find((d) => d.documentTypeId === c.documentTypeId);
      const satisfied = doc?.status === 'APPROVED';
      return {
        documentTypeId: c.documentTypeId,
        name: c.documentType.name,
        required: c.required,
        status: doc?.status ?? 'NOT_REQUESTED',
        satisfied,
        documentId: doc?.id ?? null,
      };
    });

    const pending = items.filter((i) => i.required && !i.satisfied);
    return {
      stage: query.stage,
      total: items.length,
      satisfied: items.filter((i) => i.satisfied).length,
      pendingCount: pending.length,
      complete: pending.length === 0,
      items,
      pending,
    };
  }

  /** Restricted download: customers may only access their own documents. */
  async resolveForDownload(id: string, user: AuthUser) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || !doc.storageKey) throw new AppException('DOCUMENT_NOT_FOUND');

    if (user.role === 'CUSTOMER' && doc.customerId !== user.customerId) {
      throw new AppException('FORBIDDEN');
    }

    const path = await this.storage.resolve(doc.storageKey);
    const exists = await this.storage.exists(doc.storageKey);
    if (!exists)
      throw new AppException('DOCUMENT_NOT_FOUND', 'Arquivo indisponível.');

    return {
      path,
      mimeType: doc.mimeType || 'application/octet-stream',
      fileName: doc.originalName || 'documento',
    };
  }

  /** Documents whose expiry date is within the given number of days. */
  async expiring(days: number) {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.prisma.document.findMany({
      where: {
        expiryDate: { lte: until, gte: new Date() },
        status: { in: ['APPROVED', 'RECEIVED', 'UNDER_REVIEW'] },
      },
      include: {
        documentType: true,
        vehicle: { select: { brand: true, model: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
