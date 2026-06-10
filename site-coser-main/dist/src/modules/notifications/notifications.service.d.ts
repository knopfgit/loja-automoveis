import { NotificationChannel, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
export interface CreateNotificationInput {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, any>;
    channel?: NotificationChannel;
    email?: {
        to: string;
        template: string;
        context?: Record<string, any>;
    };
}
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(input: CreateNotificationInput): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        type: string;
        userId: string;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        body: string | null;
        readAt: Date | null;
    }>;
    queueEmail(to: string, subject: string, template: string, context?: Record<string, any>): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EmailStatus;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        to: string;
        template: string;
        context: Prisma.JsonValue | null;
        attempts: number;
        lastError: string | null;
        sentAt: Date | null;
    }>;
    listForUser(userId: string, page: number, limit: number): Promise<PaginatedResult<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        type: string;
        userId: string;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        body: string | null;
        readAt: Date | null;
    }>>;
    unreadCount(userId: string): Promise<number>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        status: string;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
    }>;
}
