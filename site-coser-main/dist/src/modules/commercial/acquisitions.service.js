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
exports.AcquisitionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const financial_service_1 = require("../financial/financial.service");
const financial_constants_1 = require("../financial/financial.constants");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const ORIGIN_MAP = {
    OWN_PURCHASE: 'OWN_PURCHASE',
    CONSIGNMENT: 'CONSIGNMENT',
    TRADE_IN: 'TRADE_IN',
};
let AcquisitionsService = class AcquisitionsService {
    constructor(prisma, audit, financial) {
        this.prisma = prisma;
        this.audit = audit;
        this.financial = financial;
    }
    async create(dto, actorId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            throw new app_exception_1.AppException('VEHICLE_NOT_FOUND');
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
                category: financial_constants_1.FINANCIAL_CATEGORIES.PURCHASE,
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
    async findOne(vehicleId) {
        const acquisition = await this.prisma.vehicleAcquisition.findUnique({
            where: { vehicleId },
        });
        if (!acquisition)
            throw new app_exception_1.AppException('NOT_FOUND', 'Aquisição não encontrada.');
        return acquisition;
    }
    async findAll(pg) {
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
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
};
exports.AcquisitionsService = AcquisitionsService;
exports.AcquisitionsService = AcquisitionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        financial_service_1.FinancialService])
], AcquisitionsService);
//# sourceMappingURL=acquisitions.service.js.map