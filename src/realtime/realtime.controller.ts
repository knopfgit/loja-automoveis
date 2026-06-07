import { Controller, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { filter, map, Observable } from 'rxjs';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { RealtimeService } from './realtime.service';
import { RealtimeMessage } from './events.constants';

interface MessageEvent {
  data: string;
  type?: string;
  id?: string;
}

/**
 * Server-Sent Events stream as an alternative to WebSocket for dashboards.
 * For browsers, prefer the WebSocket gateway (carries the auth header); SSE is
 * provided for environments where WebSocket is unavailable.
 */
@ApiTags('Realtime')
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtime: RealtimeService) {}

  @Sse('stream')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({
    summary:
      'Stream de eventos em tempo real (SSE). Filtra por papel e vendedor.',
  })
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return this.realtime.asObservable().pipe(
      filter((message) => this.isAllowed(user, message)),
      map((message) => ({
        data: JSON.stringify(message),
        type: message.event,
        id: message.timestamp,
      })),
    );
  }

  private isAllowed(user: AuthUser, message: RealtimeMessage): boolean {
    const allowedByRole = !message.roles || message.roles.includes(user.role);
    const allowedBySeller =
      !message.sellerId ||
      user.role === 'ADMIN' ||
      message.sellerId === user.employeeId;
    return allowedByRole && allowedBySeller;
  }
}
