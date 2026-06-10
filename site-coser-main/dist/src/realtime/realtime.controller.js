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
exports.RealtimeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const realtime_service_1 = require("./realtime.service");
let RealtimeController = class RealtimeController {
    constructor(realtime) {
        this.realtime = realtime;
    }
    stream(user) {
        return this.realtime.asObservable().pipe((0, rxjs_1.filter)((message) => this.isAllowed(user, message)), (0, rxjs_1.map)((message) => ({
            data: JSON.stringify(message),
            type: message.event,
            id: message.timestamp,
        })));
    }
    isAllowed(user, message) {
        const allowedByRole = !message.roles || message.roles.includes(user.role);
        const allowedBySeller = !message.sellerId ||
            user.role === 'ADMIN' ||
            message.sellerId === user.employeeId;
        return allowedByRole && allowedBySeller;
    }
};
exports.RealtimeController = RealtimeController;
__decorate([
    (0, common_1.Sse)('stream'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SELLER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stream de eventos em tempo real (SSE). Filtra por papel e vendedor.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], RealtimeController.prototype, "stream", null);
exports.RealtimeController = RealtimeController = __decorate([
    (0, swagger_1.ApiTags)('Realtime'),
    (0, common_1.Controller)('realtime'),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], RealtimeController);
//# sourceMappingURL=realtime.controller.js.map