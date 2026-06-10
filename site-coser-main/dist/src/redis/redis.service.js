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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = exports.REDIS_SUBSCRIBER = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
exports.REDIS_CLIENT = 'REDIS_CLIENT';
exports.REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';
let RedisService = RedisService_1 = class RedisService {
    constructor(client, subscriber, config) {
        this.client = client;
        this.subscriber = subscriber;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.defaultTtl = config.get('redis.cacheTtl', 3600);
    }
    async get(key) {
        const raw = await this.client.get(key);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return raw;
        }
    }
    async set(key, value, ttlSeconds) {
        const payload = typeof value === 'string' ? value : JSON.stringify(value);
        await this.client.set(key, payload, 'EX', ttlSeconds ?? this.defaultTtl);
    }
    async del(...keys) {
        if (keys.length)
            await this.client.del(...keys);
    }
    async delByPattern(pattern) {
        const keys = await this.client.keys(pattern);
        if (keys.length)
            await this.client.del(...keys);
    }
    async remember(key, factory, ttlSeconds) {
        const cached = await this.get(key);
        if (cached !== null)
            return cached;
        const fresh = await factory();
        await this.set(key, fresh, ttlSeconds);
        return fresh;
    }
    async publish(channel, message) {
        await this.client.publish(channel, JSON.stringify(message));
    }
    onMessage(handler) {
        this.subscriber.on('message', (channel, raw) => {
            let parsed = raw;
            try {
                parsed = JSON.parse(raw);
            }
            catch {
            }
            handler(channel, parsed);
        });
    }
    async subscribe(...channels) {
        await this.subscriber.subscribe(...channels);
    }
    async onModuleDestroy() {
        await Promise.allSettled([this.client.quit(), this.subscriber.quit()]);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.REDIS_CLIENT)),
    __param(1, (0, common_1.Inject)(exports.REDIS_SUBSCRIBER)),
    __metadata("design:paramtypes", [ioredis_1.default,
        ioredis_1.default,
        config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map