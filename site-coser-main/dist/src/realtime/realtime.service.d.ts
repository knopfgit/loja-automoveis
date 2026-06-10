import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { EventName, RealtimeMessage } from './events.constants';
export declare const REALTIME_REDIS_CHANNEL = "realtime:events";
export declare class RealtimeService {
    private readonly emitter;
    private readonly redis;
    private readonly stream$;
    constructor(emitter: EventEmitter2, redis: RedisService);
    emit<T>(event: EventName | string, data: T, options?: {
        roles?: RealtimeMessage['roles'];
        sellerId?: string;
    }): RealtimeMessage<T>;
    asObservable(): Observable<RealtimeMessage>;
}
