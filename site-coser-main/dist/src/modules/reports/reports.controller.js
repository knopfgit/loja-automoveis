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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const csv_util_1 = require("../../common/utils/csv.util");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    constructor(service) {
        this.service = service;
    }
    respond(res, rows, format, name) {
        if (format === 'csv') {
            res.locals.rawResponse = true;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
            res.send((0, csv_util_1.toCsv)(rows));
            return;
        }
        res.json({
            success: true,
            data: rows,
            meta: { total: rows.length, timestamp: new Date().toISOString() },
        });
    }
    async run(res, format, name, loader) {
        res.locals.rawResponse = true;
        const rows = await loader();
        this.respond(res, rows, format, name);
    }
    vehiclesStock(res, format) {
        return this.run(res, format, 'estoque-veiculos', () => this.service.vehiclesStock());
    }
    vehiclesSold(res, format) {
        return this.run(res, format, 'veiculos-vendidos', () => this.service.vehiclesSold());
    }
    vehiclesAvailable(res, format) {
        return this.run(res, format, 'veiculos-disponiveis', () => this.service.vehiclesAvailable());
    }
    vehiclesStale(res, days, format) {
        return this.run(res, format, 'veiculos-parados', () => this.service.vehiclesStale(days ? Number(days) : 60));
    }
    dreConsolidated(res, from, to, format) {
        return this.run(res, format, 'dre-consolidada', () => this.service.dreConsolidated(from ? new Date(from) : undefined, to ? new Date(to) : undefined));
    }
    dreByVehicle(vehicleId, res, format) {
        return this.run(res, format, `dre-${vehicleId}`, () => this.service.dreByVehicle(vehicleId));
    }
    salesByPeriod(res, from, to, format) {
        return this.run(res, format, 'vendas-periodo', () => this.service.salesByPeriod(from ? new Date(from) : undefined, to ? new Date(to) : undefined));
    }
    salesBySeller(res, format) {
        return this.run(res, format, 'vendas-vendedor', () => this.service.salesBySeller());
    }
    commissions(res, format) {
        return this.run(res, format, 'comissoes', () => this.service.commissions());
    }
    documentsPending(res, format) {
        return this.run(res, format, 'documentos-pendentes', () => this.service.documentsPending());
    }
    documentsExpiring(res, days, format) {
        return this.run(res, format, 'documentos-vencendo', () => this.service.documentsExpiring(days ? Number(days) : 30));
    }
    maintenances(res, format) {
        return this.run(res, format, 'manutencoes', () => this.service.maintenances());
    }
    futureRevisions(res, format) {
        return this.run(res, format, 'revisoes-futuras', () => this.service.futureRevisions());
    }
    partsStock(res, format) {
        return this.run(res, format, 'estoque-pecas', () => this.service.partsStock());
    }
    partsLowStock(res, format) {
        return this.run(res, format, 'pecas-estoque-minimo', () => this.service.partsLowStock());
    }
    leads(res, format) {
        return this.run(res, format, 'leads', () => this.service.leads());
    }
    conversions(res, format) {
        return this.run(res, format, 'conversoes', () => this.service.conversions());
    }
    marketingInterested(res, format) {
        return this.run(res, format, 'clientes-promocoes', () => this.service.marketingInterested());
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('vehicles-stock'),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['json', 'csv'], required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: estoque de veículos' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "vehiclesStock", null);
__decorate([
    (0, common_1.Get)('vehicles-sold'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: veículos vendidos' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "vehiclesSold", null);
__decorate([
    (0, common_1.Get)('vehicles-available'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: veículos disponíveis' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "vehiclesAvailable", null);
__decorate([
    (0, common_1.Get)('vehicles-stale'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: veículos parados há muitos dias' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "vehiclesStale", null);
__decorate([
    (0, common_1.Get)('dre-consolidated'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: DRE consolidada' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "dreConsolidated", null);
__decorate([
    (0, common_1.Get)('dre-vehicle/:vehicleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: DRE por veículo' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "dreByVehicle", null);
__decorate([
    (0, common_1.Get)('sales-by-period'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: vendas por período' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "salesByPeriod", null);
__decorate([
    (0, common_1.Get)('sales-by-seller'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: vendas por vendedor' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "salesBySeller", null);
__decorate([
    (0, common_1.Get)('commissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: comissões' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "commissions", null);
__decorate([
    (0, common_1.Get)('documents-pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: documentos pendentes' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "documentsPending", null);
__decorate([
    (0, common_1.Get)('documents-expiring'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: documentos próximos do vencimento' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "documentsExpiring", null);
__decorate([
    (0, common_1.Get)('maintenances'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: manutenções' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "maintenances", null);
__decorate([
    (0, common_1.Get)('future-revisions'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: revisões futuras' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "futureRevisions", null);
__decorate([
    (0, common_1.Get)('parts-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: estoque de peças' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "partsStock", null);
__decorate([
    (0, common_1.Get)('parts-low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: peças abaixo do mínimo' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "partsLowStock", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: leads' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "leads", null);
__decorate([
    (0, common_1.Get)('conversions'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: conversões' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "conversions", null);
__decorate([
    (0, common_1.Get)('marketing-interested'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório: clientes interessados em promoções' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "marketingInterested", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map