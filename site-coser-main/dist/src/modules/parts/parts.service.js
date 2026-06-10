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
exports.PartsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const notifications_service_1 = require("../notifications/notifications.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const INCREASE = [
    'ENTRY',
    'RETURN',
    'CANCEL_RESERVE',
    'REVERSAL',
];
const DECREASE = [
    'EXIT',
    'RESERVE',
    'APPLY_TO_VEHICLE',
    'LOSS',
];
let PartsService = class PartsService {
    constructor(prisma, audit, realtime, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.notifications = notifications;
    }
    async create(dto, actorId) {
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
    async findAll(pg, search, lowStock) {
        const where = {
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
        let items;
        let total;
        if (lowStock) {
            const all = await this.prisma.part.findMany({ where });
            const filtered = all.filter((p) => p.quantity <= p.minQuantity);
            total = filtered.length;
            items = filtered.slice(pg.skip, pg.skip + pg.limit);
        }
        else {
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const part = await this.prisma.part.findUnique({
            where: { id },
            include: { supplier: true },
        });
        if (!part)
            throw new app_exception_1.AppException('PART_NOT_FOUND');
        return part;
    }
    async update(id, dto, actorId) {
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
    async move(id, dto, actorId) {
        const part = await this.findOne(id);
        let delta = 0;
        if (INCREASE.includes(dto.type))
            delta = Math.abs(dto.quantity);
        else if (DECREASE.includes(dto.type))
            delta = -Math.abs(dto.quantity);
        else if (dto.type === 'ADJUSTMENT')
            delta = dto.quantity;
        const newQty = part.quantity + delta;
        if (newQty < 0)
            throw new app_exception_1.AppException('PART_INSUFFICIENT_STOCK');
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
                    costPrice: dto.type === 'ENTRY' && dto.unitCost !== undefined
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
    async consumeForMaintenance(partId, quantity, maintenanceId, vehicleId, actorId) {
        const part = await this.findOne(partId);
        if (part.quantity < quantity) {
            throw new app_exception_1.AppException('PART_INSUFFICIENT_STOCK');
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
    async reverseMaintenanceConsumption(partId, quantity, maintenanceId, actorId) {
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
    async checkLowStock(partId) {
        const part = await this.prisma.part.findUnique({ where: { id: partId } });
        if (!part)
            return;
        if (part.quantity <= part.minQuantity) {
            this.realtime.emit(events_constants_1.EVENTS.PART_STOCK_LOW, {
                partId: part.id,
                name: part.name,
                quantity: part.quantity,
                minQuantity: part.minQuantity,
            }, { roles: ['ADMIN'] });
            const admins = await this.prisma.user.findMany({
                where: { role: client_1.UserRole.ADMIN, status: 'ACTIVE' },
                select: { id: true, email: true },
            });
            for (const admin of admins) {
                await this.notifications.create({
                    userId: admin.id,
                    type: events_constants_1.EVENTS.PART_STOCK_LOW,
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
    async listMovements(partId, page, limit) {
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
        return paginated_result_1.PaginatedResult.of(items, total, page, limit);
    }
    async lowStockList() {
        const all = await this.prisma.part.findMany({
            where: { status: 'ACTIVE' },
        });
        return all.filter((p) => p.quantity <= p.minQuantity);
    }
};
exports.PartsService = PartsService;
exports.PartsService = PartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        notifications_service_1.NotificationsService])
], PartsService);
//# sourceMappingURL=parts.service.js.map