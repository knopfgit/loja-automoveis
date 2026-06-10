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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const TRANSITIONS = {
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
const STATUS_TO_MOVEMENT = {
    AVAILABLE: client_1.StockMovementType.ENTRY,
    RESERVED: client_1.StockMovementType.RESERVE,
    SOLD: client_1.StockMovementType.SALE,
    CONSIGNED: client_1.StockMovementType.CONSIGNMENT,
    ARCHIVED: client_1.StockMovementType.ARCHIVE,
};
let StockService = class StockService {
    constructor(prisma, audit, realtime) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
    }
    isTransitionAllowed(from, to) {
        if (from === to)
            return true;
        return TRANSITIONS[from]?.includes(to) ?? false;
    }
    async changeStatus(vehicleId, toStatus, opts, actorId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        if (!this.isTransitionAllowed(vehicle.status, toStatus)) {
            throw new app_exception_1.AppException('VEHICLE_INVALID_STATUS_TRANSITION', `Não é possível mudar de ${vehicle.status} para ${toStatus}.`);
        }
        const fromStatus = vehicle.status;
        const movementType = opts.type ?? STATUS_TO_MOVEMENT[toStatus] ?? client_1.StockMovementType.EXIT;
        const [updated] = await this.prisma.$transaction([
            this.prisma.vehicle.update({
                where: { id: vehicleId },
                data: {
                    status: toStatus,
                    archiveReason: toStatus === 'ARCHIVED' ? opts.reason : vehicle.archiveReason,
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
        this.realtime.emit(events_constants_1.EVENTS.VEHICLE_STATUS_CHANGED, { vehicleId, fromStatus, toStatus }, { roles: ['ADMIN', 'SELLER'] });
        return updated;
    }
    async listMovements(vehicleId, page, limit) {
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
        return paginated_result_1.PaginatedResult.of(items, total, page, limit);
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService])
], StockService);
//# sourceMappingURL=stock.service.js.map