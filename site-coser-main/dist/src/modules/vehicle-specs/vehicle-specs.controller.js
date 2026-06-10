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
exports.VehicleSpecsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const vehicle_specs_service_1 = require("./vehicle-specs.service");
let VehicleSpecsController = class VehicleSpecsController {
    constructor(service) {
        this.service = service;
    }
    brands() {
        return this.service.getBrands();
    }
    models(brandId) {
        return this.service.getModels(brandId);
    }
    years(modelId) {
        return this.service.getYears(modelId);
    }
    versions(modelId, year) {
        return this.service.getVersions(modelId, year ? Number(year) : undefined);
    }
    search(brand, model, year, version) {
        return this.service.search({
            brand,
            model,
            year: Number(year),
            version,
        });
    }
};
exports.VehicleSpecsController = VehicleSpecsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('brands'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar marcas disponíveis no catálogo' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehicleSpecsController.prototype, "brands", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('models'),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: true }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar modelos por marca' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleSpecsController.prototype, "models", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('years'),
    (0, swagger_1.ApiQuery)({ name: 'modelId', required: true }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar anos por modelo' }),
    __param(0, (0, common_1.Query)('modelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleSpecsController.prototype, "years", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('versions'),
    (0, swagger_1.ApiQuery)({ name: 'modelId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar versões por modelo e ano' }),
    __param(0, (0, common_1.Query)('modelId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleSpecsController.prototype, "versions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiQuery)({ name: 'brand', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'model', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'version', required: false }),
    (0, swagger_1.ApiOperation)({
        summary: 'Consultar ficha técnica por marca/modelo/ano/versão',
    }),
    __param(0, (0, common_1.Query)('brand')),
    __param(1, (0, common_1.Query)('model')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleSpecsController.prototype, "search", null);
exports.VehicleSpecsController = VehicleSpecsController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Specs (catálogo / ficha técnica)'),
    (0, common_1.Controller)('vehicle-specs'),
    __metadata("design:paramtypes", [vehicle_specs_service_1.VehicleSpecsService])
], VehicleSpecsController);
//# sourceMappingURL=vehicle-specs.controller.js.map