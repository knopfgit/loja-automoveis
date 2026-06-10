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
var VehicleSpecsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleSpecsService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
const vehicle_specs_provider_interface_1 = require("./interfaces/vehicle-specs-provider.interface");
let VehicleSpecsService = VehicleSpecsService_1 = class VehicleSpecsService {
    constructor(provider, redis) {
        this.provider = provider;
        this.redis = redis;
        this.logger = new common_1.Logger(VehicleSpecsService_1.name);
        this.prefix = 'specs';
    }
    async safe(key, fn, fallback) {
        try {
            return await this.redis.remember(`${this.prefix}:${key}`, fn);
        }
        catch (err) {
            this.logger.warn(`Spec provider "${this.provider.name}" failed for ${key}: ${err instanceof Error ? err.message : err}. Falling back.`);
            return fallback;
        }
    }
    getBrands() {
        return this.safe('brands', () => this.provider.getBrands(), []);
    }
    getModels(brandId) {
        return this.safe(`models:${brandId}`, () => this.provider.getModels(brandId), []);
    }
    getYears(modelId) {
        return this.safe(`years:${modelId}`, () => this.provider.getYears(modelId), []);
    }
    getVersions(modelId, year) {
        return this.safe(`versions:${modelId}:${year ?? 'all'}`, () => this.provider.getVersions(modelId, year), []);
    }
    search(params) {
        const key = `search:${params.brand}:${params.model}:${params.year}:${params.version ?? ''}`;
        return this.safe(key, () => this.provider.search(params), null);
    }
};
exports.VehicleSpecsService = VehicleSpecsService;
exports.VehicleSpecsService = VehicleSpecsService = VehicleSpecsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(vehicle_specs_provider_interface_1.VEHICLE_SPECS_PROVIDER)),
    __metadata("design:paramtypes", [Object, redis_service_1.RedisService])
], VehicleSpecsService);
//# sourceMappingURL=vehicle-specs.service.js.map