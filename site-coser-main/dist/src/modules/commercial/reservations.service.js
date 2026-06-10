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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const stock_service_1 = require("../vehicles/stock.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
let ReservationsService = class ReservationsService {
    constructor(prisma, config, audit, stock) {
        this.prisma = prisma;
        this.config = config;
        this.audit = audit;
        this.stock = stock;
    }
    async create(dto, actorId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        const days = dto.durationDays ??
            this.config.get('business.reservationDefaultDays', 3);
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
        await this.stock.changeStatus(dto.vehicleId, 'RESERVED', { reason: 'reservation_created', type: 'RESERVE' }, actorId);
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
    async cancel(id, reason, actorId) {
        const reservation = await this.prisma.vehicleReservation.findUnique({
            where: { id },
        });
        if (!reservation)
            throw new app_exception_1.AppException('RESERVATION_NOT_FOUND');
        await this.prisma.vehicleReservation.update({
            where: { id },
            data: { status: 'CANCELED', cancelReason: reason },
        });
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: reservation.vehicleId },
        });
        if (vehicle?.status === 'RESERVED') {
            await this.stock.changeStatus(reservation.vehicleId, 'AVAILABLE', { reason: 'reservation_canceled', type: 'CANCEL_RESERVE' }, actorId);
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
    async findAll(pg, filters) {
        const where = {
            status: filters.status,
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        stock_service_1.StockService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map