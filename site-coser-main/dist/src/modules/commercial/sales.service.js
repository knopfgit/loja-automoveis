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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const stock_service_1 = require("../vehicles/stock.service");
const financial_service_1 = require("../financial/financial.service");
const financial_constants_1 = require("../financial/financial.constants");
const commissions_service_1 = require("../commissions/commissions.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const dec = (v) => (v ? Number(v) : 0);
let SalesService = class SalesService {
    constructor(prisma, audit, realtime, stock, financial, commissions) {
        this.prisma = prisma;
        this.audit = audit;
        this.realtime = realtime;
        this.stock = stock;
        this.financial = financial;
        this.commissions = commissions;
    }
    computeFinal(dto) {
        const base = dto.negotiatedPrice ?? dto.announcedPrice ?? 0;
        return Math.max(0, base - (dto.discount ?? 0));
    }
    async create(dto, sellerIdFallback, actorId) {
        const sellerId = dto.sellerId ?? sellerIdFallback;
        if (!sellerId) {
            throw new app_exception_1.AppException('EMPLOYEE_NOT_FOUND', 'Vendedor não informado.');
        }
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
        const finalPrice = this.computeFinal({
            announcedPrice: dto.announcedPrice ?? dec(vehicle.announcedPrice),
            negotiatedPrice: dto.negotiatedPrice,
            discount: dto.discount,
        });
        const sale = await this.prisma.vehicleSale.create({
            data: {
                vehicleId: dto.vehicleId,
                customerId: dto.customerId,
                sellerId,
                announcedPrice: dto.announcedPrice ?? vehicle.announcedPrice,
                negotiatedPrice: dto.negotiatedPrice,
                discount: dto.discount,
                finalPrice,
                paymentMethod: dto.paymentMethod,
                downPayment: dto.downPayment,
                installments: dto.installments,
                financing: dto.financing ?? false,
                financialInstitution: dto.financialInstitution,
                tradeInVehicleId: dto.tradeInVehicleId,
                deliveryForecast: dto.deliveryForecast
                    ? new Date(dto.deliveryForecast)
                    : undefined,
                notes: dto.notes,
                status: 'NEGOTIATING',
            },
        });
        if (this.stock.isTransitionAllowed(vehicle.status, 'NEGOTIATING')) {
            await this.stock.changeStatus(dto.vehicleId, 'NEGOTIATING', { reason: 'sale_started' }, actorId);
        }
        await this.audit.log({
            actorId,
            action: 'CREATE',
            entity: 'VehicleSale',
            entityId: sale.id,
            after: { vehicleId: dto.vehicleId, sellerId, finalPrice },
        });
        this.realtime.emit(events_constants_1.EVENTS.SALE_CREATED, { id: sale.id, vehicleId: dto.vehicleId }, { roles: ['ADMIN'], sellerId });
        return sale;
    }
    async update(id, dto, actorId) {
        const sale = await this.getOrThrow(id);
        const finalPrice = dto.negotiatedPrice !== undefined || dto.discount !== undefined
            ? this.computeFinal({
                announcedPrice: dec(sale.announcedPrice),
                negotiatedPrice: dto.negotiatedPrice ?? dec(sale.negotiatedPrice),
                discount: dto.discount ?? dec(sale.discount),
            })
            : undefined;
        const updated = await this.prisma.vehicleSale.update({
            where: { id },
            data: {
                negotiatedPrice: dto.negotiatedPrice,
                discount: dto.discount,
                finalPrice,
                paymentMethod: dto.paymentMethod,
                downPayment: dto.downPayment,
                installments: dto.installments,
                financing: dto.financing,
                financialInstitution: dto.financialInstitution,
                tradeInVehicleId: dto.tradeInVehicleId,
                deliveryForecast: dto.deliveryForecast
                    ? new Date(dto.deliveryForecast)
                    : undefined,
                notes: dto.notes,
            },
        });
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'VehicleSale',
            entityId: id,
            before: sale,
            after: updated,
        });
        return updated;
    }
    async updateStatus(id, dto, actorId) {
        const sale = await this.getOrThrow(id);
        if (dto.status === 'COMPLETED') {
            return this.complete(sale.id, dto.finalPrice, dto.notes, actorId);
        }
        if (dto.status === 'CANCELED') {
            const vehicle = await this.prisma.vehicle.findUnique({
                where: { id: sale.vehicleId },
            });
            if (vehicle &&
                this.stock.isTransitionAllowed(vehicle.status, 'AVAILABLE')) {
                await this.stock.changeStatus(sale.vehicleId, 'AVAILABLE', { reason: 'sale_canceled' }, actorId);
            }
        }
        const updated = await this.prisma.vehicleSale.update({
            where: { id },
            data: { status: dto.status, notes: dto.notes ?? sale.notes },
        });
        await this.audit.log({
            actorId,
            action: 'STATUS_CHANGE',
            entity: 'VehicleSale',
            entityId: id,
            before: { status: sale.status },
            after: { status: dto.status },
        });
        return updated;
    }
    async complete(id, finalPriceOverride, notes, actorId) {
        const sale = await this.getOrThrow(id);
        const finalPrice = finalPriceOverride ?? dec(sale.finalPrice);
        if (!finalPrice) {
            throw new app_exception_1.AppException('VALIDATION_ERROR', 'finalPrice é obrigatório para concluir a venda.');
        }
        const updated = await this.prisma.vehicleSale.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                finalPrice,
                saleDate: new Date(),
                notes: notes ?? sale.notes,
            },
        });
        await this.prisma.vehicle.update({
            where: { id: sale.vehicleId },
            data: { soldPrice: finalPrice, soldAt: new Date() },
        });
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: sale.vehicleId },
        });
        if (vehicle && this.stock.isTransitionAllowed(vehicle.status, 'SOLD')) {
            await this.stock.changeStatus(sale.vehicleId, 'SOLD', { reason: 'sale_completed', type: 'SALE' }, actorId);
        }
        await this.financial.addAutomaticEntry({
            vehicleId: sale.vehicleId,
            nature: 'REVENUE',
            category: financial_constants_1.FINANCIAL_CATEGORIES.SALE,
            amount: finalPrice,
            description: 'Venda do veículo',
            sourceModule: 'sale',
            externalRef: sale.id,
            responsibleId: actorId,
        });
        await this.commissions.generateForSale(updated, actorId);
        await this.audit.log({
            actorId,
            action: 'STATUS_CHANGE',
            entity: 'VehicleSale',
            entityId: id,
            after: { status: 'COMPLETED', finalPrice },
        });
        this.realtime.emit(events_constants_1.EVENTS.SALE_COMPLETED, { id: sale.id, vehicleId: sale.vehicleId, finalPrice }, { roles: ['ADMIN'], sellerId: sale.sellerId });
        return updated;
    }
    async markDelivered(id, actorId) {
        const sale = await this.getOrThrow(id);
        const updated = await this.prisma.vehicleSale.update({
            where: { id },
            data: { deliveredAt: new Date() },
        });
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: sale.vehicleId },
        });
        if (vehicle &&
            this.stock.isTransitionAllowed(vehicle.status, 'DELIVERED')) {
            await this.stock.changeStatus(sale.vehicleId, 'DELIVERED', { reason: 'delivered' }, actorId);
        }
        return updated;
    }
    async getOrThrow(id) {
        const sale = await this.prisma.vehicleSale.findUnique({ where: { id } });
        if (!sale)
            throw new app_exception_1.AppException('SALE_NOT_FOUND');
        return sale;
    }
    async findOne(id, user) {
        const sale = await this.prisma.vehicleSale.findUnique({
            where: { id },
            include: {
                vehicle: { select: { brand: true, model: true, modelYear: true } },
                customer: { select: { fullName: true } },
                commission: true,
            },
        });
        if (!sale)
            throw new app_exception_1.AppException('SALE_NOT_FOUND');
        if (user?.role === 'SELLER' && sale.sellerId !== user.employeeId) {
            throw new app_exception_1.AppException('FORBIDDEN');
        }
        return sale;
    }
    async findAll(pg, filters) {
        const where = {
            sellerId: filters.sellerId,
            status: filters.status,
            saleDate: filters.from || filters.to
                ? { gte: filters.from, lte: filters.to }
                : undefined,
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleSale.findMany({
                where,
                include: {
                    vehicle: { select: { brand: true, model: true } },
                    customer: { select: { fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.vehicleSale.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        stock_service_1.StockService,
        financial_service_1.FinancialService,
        commissions_service_1.CommissionsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map