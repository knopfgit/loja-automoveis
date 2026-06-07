import { Injectable } from '@nestjs/common';
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
  /** When set, also enqueue an email using this template. */
  email?: { to: string; template: string; context?: Record<string, any> };
}

/**
 * Creates in-app notifications and enqueues asynchronous emails. Email delivery
 * is performed by the EmailQueue scheduled job (see JobsService).
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: (input.data as Prisma.InputJsonValue) ?? undefined,
        channel: input.channel ?? NotificationChannel.IN_APP,
      },
    });

    if (input.email) {
      await this.queueEmail(
        input.email.to,
        input.title,
        input.email.template,
        input.email.context,
      );
    }
    return notification;
  }

  async queueEmail(
    to: string,
    subject: string,
    template: string,
    context?: Record<string, any>,
  ) {
    return this.prisma.emailQueue.create({
      data: {
        to,
        subject,
        template,
        context: (context as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async listForUser(userId: string, page: number, limit: number) {
    const where: Prisma.NotificationWhereInput = { userId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return PaginatedResult.of(items, total, page, limit);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { status: 'READ', readAt: new Date() },
    });
    return { id, status: 'READ' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });
    return { success: true };
  }
}
