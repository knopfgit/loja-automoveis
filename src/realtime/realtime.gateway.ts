import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { RealtimeMessage } from './events.constants';

/**
 * Socket.IO gateway. Clients connect with an access token (handshake auth or
 * Authorization header) and are joined to rooms by role and by sellerId, so
 * targeted messages reach only the right audience.
 *
 * Rooms:
 *   role:ADMIN | role:SELLER | role:CUSTOMER
 *   seller:<employeeId>
 *   user:<userId>
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtime: RealtimeService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit() {
    // Bridge the realtime stream to connected socket clients.
    this.realtime.asObservable().subscribe((message) => {
      this.dispatch(message);
    });
    this.logger.log('Realtime WebSocket gateway initialized at /realtime');
  }

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace(
          'Bearer ',
          '',
        );
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
      client.join(`role:${payload.role}`);
      client.join(`user:${payload.sub}`);
      if (payload.employeeId) client.join(`seller:${payload.employeeId}`);
    } catch {
      client.disconnect();
    }
  }

  private dispatch(message: RealtimeMessage) {
    if (message.sellerId) {
      this.server.to(`seller:${message.sellerId}`).emit(message.event, message);
      // Admins also observe everything.
      this.server.to('role:ADMIN').emit(message.event, message);
      return;
    }
    if (message.roles && message.roles.length) {
      message.roles.forEach((role) =>
        this.server.to(`role:${role}`).emit(message.event, message),
      );
      return;
    }
    // Broadcast to all connected clients.
    this.server.emit(message.event, message);
  }
}
