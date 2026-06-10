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
exports.RealtimeService = exports.REALTIME_REDIS_CHANNEL = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
const redis_service_1 = require("../redis/redis.service");
exports.REALTIME_REDIS_CHANNEL = 'realtime:events';
let RealtimeService = class RealtimeService {
    constructor(emitter, redis) {
        this.emitter = emitter;
        this.redis = redis;
        this.stream$ = new rxjs_1.Subject();
    }
    emit(event, data, options) {
        const message = {
            event,
            data,
            roles: options?.roles,
            sellerId: options?.sellerId,
            timestamp: new Date().toISOString(),
        };
        this.stream$.next(message);
        this.emitter.emit(event, message);
        void this.redis.publish(exports.REALTIME_REDIS_CHANNEL, message);
        return message;
    }
    asObservable() {
        return this.stream$.asObservable();
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        redis_service_1.RedisService])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map