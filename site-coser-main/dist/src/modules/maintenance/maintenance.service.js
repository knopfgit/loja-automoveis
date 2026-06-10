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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const parts_service_1 = require("../parts/parts.service");
const financial_service_1 = require("../financial/financial.service");
const financial_constants_1 = require("../financial/financial.constants");
let MaintenanceService = class MaintenanceService {
    constructor(prisma, audit, realtime, parts, financial) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.parts = parts;
        this.financial = financial;
    }
    async create(dto, actorId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
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
        this.realtime.emit(events_constants_1.EVENTS.MAINTENANCE_CREATED, { id: maintenance.id, vehicleId: dto.vehicleId }, { roles: ['ADMIN'] });
        return maintenance;
    }
    async findAll(pg, vehicleId, status) {
        const where = {
            vehicleId,
            status: status,
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const maintenance = await this.prisma.maintenance.findUnique({
            where: { id },
            include: {
                parts: { include: { part: true } },
                supplier: true,
                vehicle: true,
            },
        });
        if (!maintenance)
            throw new app_exception_1.AppException('MAINTENANCE_NOT_FOUND');
        return maintenance;
    }
    async update(id, dto, actorId) {
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
    async addPart(id, dto, actorId) {
        const maintenance = await this.findOne(id);
        if (maintenance.status === 'COMPLETED' ||
            maintenance.status === 'CANCELED') {
            throw new app_exception_1.AppException('CONFLICT', 'Não é possível adicionar peças a uma manutenção finalizada/cancelada.');
        }
        const { unitCost, totalCost } = await this.parts.consumeForMaintenance(dto.partId, dto.quantity, id, maintenance.vehicleId, actorId);
        const maintenancePart = await this.prisma.maintenancePart.create({
            data: {
                maintenanceId: id,
                partId: dto.partId,
                quantity: dto.quantity,
                unitCost,
                totalCost,
            },
        });
        await this.financial.addAutomaticEntry({
            vehicleId: maintenance.vehicleId,
            nature: 'EXPENSE',
            category: financial_constants_1.FINANCIAL_CATEGORIES.PARTS,
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
    async removePart(id, maintenancePartId, actorId) {
        const maintenance = await this.findOne(id);
        const mp = await this.prisma.maintenancePart.findFirst({
            where: { id: maintenancePartId, maintenanceId: id },
        });
        if (!mp)
            throw new app_exception_1.AppException('NOT_FOUND', 'Item de peça não encontrado.');
        if (mp.reversed)
            throw new app_exception_1.AppException('CONFLICT', 'Item já estornado.');
        await this.parts.reverseMaintenanceConsumption(mp.partId, mp.quantity, id, actorId);
        await this.financial.removeBySourceRef('parts', mp.id, maintenance.vehicleId);
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
    async recomputeCosts(id) {
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
    async complete(id, dto, actorId) {
        const maintenance = await this.findOne(id);
        if (maintenance.status === 'COMPLETED') {
            throw new app_exception_1.AppException('CONFLICT', 'Manutenção já finalizada.');
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
        if (laborCost > 0) {
            await this.financial.addAutomaticEntry({
                vehicleId: maintenance.vehicleId,
                nature: 'EXPENSE',
                category: financial_constants_1.FINANCIAL_CATEGORIES.LABOR,
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
        this.realtime.emit(events_constants_1.EVENTS.MAINTENANCE_COMPLETED, { id, vehicleId: maintenance.vehicleId }, { roles: ['ADMIN'] });
        return this.findOne(id);
    }
    async cancel(id, actorId) {
        const maintenance = await this.findOne(id);
        for (const mp of maintenance.parts) {
            if (!mp.reversed) {
                await this.parts.reverseMaintenanceConsumption(mp.partId, mp.quantity, id, actorId);
                await this.financial.removeBySourceRef('parts', mp.id, maintenance.vehicleId);
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
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        parts_service_1.PartsService,
        financial_service_1.FinancialService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map