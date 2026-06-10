import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { RedisService } from '../../redis/redis.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class JobsService {
    private readonly prisma;
    private readonly config;
    private readonly mail;
    private readonly redis;
    private readonly realtime;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, mail: MailService, redis: RedisService, realtime: RealtimeService, notifications: NotificationsService);
    processEmailQueue(): Promise<void>;
    recalcDashboards(): Promise<void>;
    expireReservations(): Promise<void>;
    checkDocuments(): Promise<void>;
    checkFutureRevisions(): Promise<void>;
    checkLowStockParts(): Promise<void>;
    cleanupTokens(): Promise<void>;
    processPrivacyDeletions(): Promise<void>;
}
