import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly realtime;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    server: Server;
    constructor(realtime: RealtimeService, jwt: JwtService, config: ConfigService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    private dispatch;
}
