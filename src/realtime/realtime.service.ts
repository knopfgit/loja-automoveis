import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Subject, Observable } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { EventName, RealtimeMessage } from './events.constants';

export const REALTIME_REDIS_CHANNEL = 'realtime:events';

/**
 * Single entry point for emitting domain events. Fan-out targets:
 *  1. RxJS subject  -> consumed by the SSE endpoint
 *  2. EventEmitter2 -> in-process listeners (notifications, dashboards)
 *  3. Redis pub/sub -> cross-instance delivery (and WebSocket gateway)
 */
@Injectable()
export class RealtimeService {
  private readonly stream$ = new Subject<RealtimeMessage>();

  constructor(
    private readonly emitter: EventEmitter2,
    private readonly redis: RedisService,
  ) {}

  emit<T>(
    event: EventName | string,
    data: T,
    options?: { roles?: RealtimeMessage['roles']; sellerId?: string },
  ): RealtimeMessage<T> {
    const message: RealtimeMessage<T> = {
      event,
      data,
      roles: options?.roles,
      sellerId: options?.sellerId,
      timestamp: new Date().toISOString(),
    };

    // 1. local SSE stream
    this.stream$.next(message);
    // 2. in-process listeners
    this.emitter.emit(event, message);
    // 3. cross-instance broadcast
    void this.redis.publish(REALTIME_REDIS_CHANNEL, message);

    return message;
  }

  /** Observable used by the SSE controller. */
  asObservable(): Observable<RealtimeMessage> {
    return this.stream$.asObservable();
  }
}
