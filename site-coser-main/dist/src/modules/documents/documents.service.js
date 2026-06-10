"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const storage_service_1 = require("../../storage/storage.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
let DocumentsService = class DocumentsService {
    constructor(prisma, audit, realtime, storage) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.storage = storage;
    }
    listTypes(ownerType) {
        return this.prisma.documentType.findMany({
            where: { ownerType: ownerType },
            orderBy: { name: 'asc' },
        });
    }
    createType(dto) {
        return this.prisma.documentType.create({ data: dto });
    }
    async updateType(id, dto) {
        const type = await this.prisma.documentType.findUnique({ where: { id } });
        if (!type)
            throw new app_exception_1.AppException('NOT_FOUND', 'Tipo de documento não encontrado.');
        return this.prisma.documentType.update({ where: { id }, data: dto });
    }
    listChecklists(stage) {
        return this.prisma.documentChecklist.findMany({
            where: { stage: stage, active: true },
            include: { documentType: true },
            orderBy: [{ stage: 'asc' }, { position: 'asc' }],
        });
    }
    upsertChecklist(dto) {
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
    async removeChecklist(id) {
        await this.prisma.documentChecklist.update({
            where: { id },
            data: { active: false },
        });
        return { success: true };
    }
    async create(dto, actorId) {
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
        if (doc.status?.startsWith('AWAITING') ||
            doc.status === 'PENDING_REQUEST') {
            this.realtime.emit(events_constants_1.EVENTS.DOCUMENT_PENDING, { documentId: doc.id, vehicleId: doc.vehicleId }, { roles: ['ADMIN', 'SELLER'] });
        }
        return doc;
    }
    async upload(documentId, file, meta, actorId) {
        if (!file)
            throw new app_exception_1.AppException('VALIDATION_ERROR', 'Arquivo ausente.');
        const stored = await this.storage.save(file, 'documents');
        let doc;
        if (documentId) {
            doc = await this.prisma.document.findUnique({
                where: { id: documentId },
            });
            if (!doc)
                throw new app_exception_1.AppException('DOCUMENT_NOT_FOUND');
        }
        else {
            if (!meta.documentTypeId || !meta.ownerType) {
                throw new app_exception_1.AppException('VALIDATION_ERROR', 'documentTypeId e ownerType são obrigatórios.');
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
    async validate(id, dto, actorId) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new app_exception_1.AppException('DOCUMENT_NOT_FOUND');
        const status = dto.status === 'APPROVED'
            ? client_1.DocumentStatus.APPROVED
            : client_1.DocumentStatus.REJECTED;
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
    async findMany(pg, filters) {
        const where = {
            vehicleId: filters.vehicleId,
            customerId: filters.customerId,
            saleId: filters.saleId,
            status: filters.status,
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
            include: { documentType: true, versions: true },
        });
        if (!doc)
            throw new app_exception_1.AppException('DOCUMENT_NOT_FOUND');
        return doc;
    }
    async checklistStatus(query) {
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
                ].filter(Boolean),
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
    async resolveForDownload(id, user) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc || !doc.storageKey)
            throw new app_exception_1.AppException('DOCUMENT_NOT_FOUND');
        if (user.role === 'CUSTOMER' && doc.customerId !== user.customerId) {
            throw new app_exception_1.AppException('FORBIDDEN');
        }
        const path = await this.storage.resolve(doc.storageKey);
        const exists = await this.storage.exists(doc.storageKey);
        if (!exists)
            throw new app_exception_1.AppException('DOCUMENT_NOT_FOUND', 'Arquivo indisponível.');
        return {
            path,
            mimeType: doc.mimeType || 'application/octet-stream',
            fileName: doc.originalName || 'documento',
        };
    }
    async expiring(days) {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        storage_service_1.StorageService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map