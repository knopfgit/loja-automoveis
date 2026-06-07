import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../dto/paginated-result';

/**
 * Wraps every successful response in the standard envelope:
 *   { success: true, data, meta: { timestamp, ...pagination } }
 *
 * Endpoints that return a PaginatedResult get the list meta automatically.
 * Endpoints can opt-out (e.g. file streams) by setting the response directly.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        const timestamp = new Date().toISOString();

        // Allow raw passthrough (e.g. SSE / file download) when flagged.
        const res = context.switchToHttp().getResponse();
        if (res?.locals?.rawResponse) {
          return payload;
        }

        if (payload instanceof PaginatedResult) {
          return {
            success: true,
            data: payload.items,
            meta: { ...payload.meta, timestamp },
          };
        }

        return {
          success: true,
          data: payload ?? null,
          meta: { timestamp },
        };
      }),
    );
  }
}
