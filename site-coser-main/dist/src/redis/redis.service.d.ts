import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare const REDIS_CLIENT = "REDIS_CLIENT";
export declare const REDIS_SUBSCRIBER = "REDIS_SUBSCRIBER";
export declare class RedisService implements OnModuleDestroy {
    readonly client: Redis;
    readonly subscriber: Redis;
    private readonly logger;
    private readonly defaultTtl;
    constructor(client: Redis, subscriber: Redis, config: ConfigService);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
    remember<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    publish(channel: string, message: unknown): Promise<void>;
    onMessage(handler: (channel: string, message: any) => void): void;
    subscribe(...channels: string[]): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
