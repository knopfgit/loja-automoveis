import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';

/**
 * Thin wrapper around ioredis providing caching helpers and pub/sub for events.
 * Two connections are used: one for commands and one dedicated to subscriptions
 * (ioredis requires a separate connection when in subscriber mode).
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly defaultTtl: number;

  constructor(
    @Inject(REDIS_CLIENT) public readonly client: Redis,
    @Inject(REDIS_SUBSCRIBER) public readonly subscriber: Redis,
    config: ConfigService,
  ) {
    this.defaultTtl = config.get<number>('redis.cacheTtl', 3600);
  }

  // ---- Cache helpers ----
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.set(key, payload, 'EX', ttlSeconds ?? this.defaultTtl);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }

  /**
   * Cache-aside helper: returns cached value or computes, caches and returns.
   */
  async remember<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await factory();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  // ---- Pub/Sub ----
  async publish(channel: string, message: unknown): Promise<void> {
    await this.client.publish(channel, JSON.stringify(message));
  }

  onMessage(handler: (channel: string, message: any) => void): void {
    this.subscriber.on('message', (channel, raw) => {
      let parsed: any = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // keep raw
      }
      handler(channel, parsed);
    });
  }

  async subscribe(...channels: string[]): Promise<void> {
    await this.subscriber.subscribe(...channels);
  }

  async onModuleDestroy() {
    await Promise.allSettled([this.client.quit(), this.subscriber.quit()]);
  }
}
