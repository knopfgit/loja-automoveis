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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const paginated_result_1 = require("../../common/dto/paginated-result");
const dre_service_1 = require("./dre.service");
let FinancialService = class FinancialService {
    constructor(prisma, dre, audit) {
        this.prisma = prisma;
        this.dre = dre;
        this.audit = audit;
    }
    async addAutomaticEntry(input) {
        const entry = await this.prisma.financialEntry.create({
            data: {
                vehicleId: input.vehicleId,
                nature: input.nature,
                category: input.category,
                amount: input.amount,
                description: input.description,
                origin: client_1.FinancialOrigin.AUTOMATIC,
                sourceModule: input.sourceModule,
                externalRef: input.externalRef,
                responsibleId: input.responsibleId,
            },
        });
        await this.dre.recalculate(input.vehicleId);
        return entry;
    }
    async removeBySourceRef(sourceModule, externalRef, vehicleId) {
        const where = {
            sourceModule,
            externalRef,
        };
        const removed = await this.prisma.financialEntry.deleteMany({ where });
        if (vehicleId)
            await this.dre.recalculate(vehicleId);
        return removed;
    }
    async createManual(input, actorId) {
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
                origin: client_1.FinancialOrigin.MANUAL,
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
        if (input.vehicleId)
            await this.dre.recalculate(input.vehicleId);
        return entry;
    }
    async remove(id, actorId) {
        const entry = await this.prisma.financialEntry.findUnique({
            where: { id },
        });
        if (!entry)
            return { success: true };
        await this.prisma.financialEntry.delete({ where: { id } });
        await this.audit.log({
            actorId,
            action: 'DELETE',
            entity: 'FinancialEntry',
            entityId: id,
            before: entry,
        });
        if (entry.vehicleId)
            await this.dre.recalculate(entry.vehicleId);
        return { success: true };
    }
    async listByVehicle(vehicleId, page, limit) {
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
        return paginated_result_1.PaginatedResult.of(items, total, page, limit);
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dre_service_1.DreService,
        audit_service_1.AuditService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map