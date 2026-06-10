"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleSpecsModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_specs_controller_1 = require("./vehicle-specs.controller");
const vehicle_specs_service_1 = require("./vehicle-specs.service");
const mock_vehicle_specs_provider_1 = require("./providers/mock-vehicle-specs.provider");
const vehicle_specs_provider_interface_1 = require("./interfaces/vehicle-specs-provider.interface");
let VehicleSpecsModule = class VehicleSpecsModule {
};
exports.VehicleSpecsModule = VehicleSpecsModule;
exports.VehicleSpecsModule = VehicleSpecsModule = __decorate([
    (0, common_1.Module)({
        controllers: [vehicle_specs_controller_1.VehicleSpecsController],
        providers: [
            mock_vehicle_specs_provider_1.MockVehicleSpecsProvider,
            {
                provide: vehicle_specs_provider_interface_1.VEHICLE_SPECS_PROVIDER,
                useExisting: mock_vehicle_specs_provider_1.MockVehicleSpecsProvider,
            },
            vehicle_specs_service_1.VehicleSpecsService,
        ],
        exports: [vehicle_specs_service_1.VehicleSpecsService],
    })
], VehicleSpecsModule);
//# sourceMappingURL=vehicle-specs.module.js.map