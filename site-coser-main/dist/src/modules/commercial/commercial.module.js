"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialModule = void 0;
const common_1 = require("@nestjs/common");
const vehicles_module_1 = require("../vehicles/vehicles.module");
const commissions_module_1 = require("../commissions/commissions.module");
const commercial_controller_1 = require("./commercial.controller");
const acquisitions_service_1 = require("./acquisitions.service");
const reservations_service_1 = require("./reservations.service");
const sales_service_1 = require("./sales.service");
let CommercialModule = class CommercialModule {
};
exports.CommercialModule = CommercialModule;
exports.CommercialModule = CommercialModule = __decorate([
    (0, common_1.Module)({
        imports: [vehicles_module_1.VehiclesModule, commissions_module_1.CommissionsModule],
        controllers: [
            commercial_controller_1.AcquisitionsController,
            commercial_controller_1.ReservationsController,
            commercial_controller_1.SalesController,
        ],
        providers: [acquisitions_service_1.AcquisitionsService, reservations_service_1.ReservationsService, sales_service_1.SalesService],
        exports: [acquisitions_service_1.AcquisitionsService, reservations_service_1.ReservationsService, sales_service_1.SalesService],
    })
], CommercialModule);
//# sourceMappingURL=commercial.module.js.map