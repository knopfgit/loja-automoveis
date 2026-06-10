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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const realtime_service_1 = require("./realtime.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor(realtime, jwt, config) {
        this.realtime = realtime;
        this.jwt = jwt;
        this.config = config;
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
    }
    afterInit() {
        this.realtime.asObservable().subscribe((message) => {
            this.dispatch(message);
        });
        this.logger.log('Realtime WebSocket gateway initialized at /realtime');
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwt.verify(token, {
                secret: this.config.get('jwt.accessSecret'),
            });
            client.join(`role:${payload.role}`);
            client.join(`user:${payload.sub}`);
            if (payload.employeeId)
                client.join(`seller:${payload.employeeId}`);
        }
        catch {
            client.disconnect();
        }
    }
    dispatch(message) {
        if (message.sellerId) {
            this.server.to(`seller:${message.sellerId}`).emit(message.event, message);
            this.server.to('role:ADMIN').emit(message.event, message);
            return;
        }
        if (message.roles && message.roles.length) {
            message.roles.forEach((role) => this.server.to(`role:${role}`).emit(message.event, message));
            return;
        }
        this.server.emit(message.event, message);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/realtime',
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService,
        jwt_1.JwtService,
        config_1.ConfigService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map