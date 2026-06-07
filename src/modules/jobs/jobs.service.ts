import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { RedisService } from '../../redis/redis.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { EVENTS } from '../../realtime/events.constants';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Scheduled background jobs. All cron methods are resilient: failures are logged
 * and never crash the scheduler.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly redis: RedisService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  // Every minute: drain the email queue.
  @Cron(CronExpression.EVERY_MINUTE)
  async processEmailQueue() {
    const pending = await this.prisma.emailQueue.findMany({
      where: { status: 'PENDING', attempts: { lt: 5 } },
      take: 20,
    });
    for (const email of pending) {
      await this.prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'PROCESSING' },
      });
      try {
        await this.mail.send({
          to: email.to,
          subject: email.subject,
          template: email.template,
          context: (email.context as Record<string, any>) ?? {},
        });
        await this.prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (err) {
        await this.prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'PENDING',
            attempts: { increment: 1 },
            lastError: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }
  }

  // Every 5 minutes: refresh dashboard cache and broadcast.
  @Cron(CronExpression.EVERY_5_MINUTES)
  async recalcDashboards() {
    await this.redis.del('dashboard:admin');
    this.realtime.emit(EVENTS.DASHBOARD_UPDATED, {
      at: new Date().toISOString(),
    });
  }

  // Hourly: expire reservations past their due date.
  @Cron(CronExpression.EVERY_HOUR)
  async expireReservations() {
    const expired = await this.prisma.vehicleReservation.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
    });
    for (const r of expired) {
      await this.prisma.vehicleReservation.update({
        where: { id: r.id },
        data: { status: 'EXPIRED' },
      });
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: r.vehicleId },
      });
      if (vehicle?.status === 'RESERVED') {
        await this.prisma.vehicle.update({
          where: { id: r.vehicleId },
          data: { status: 'AVAILABLE' },
        });
        await this.prisma.vehicleStockMovement.create({
          data: {
            vehicleId: r.vehicleId,
            type: 'CANCEL_RESERVE',
            fromStatus: 'RESERVED',
            toStatus: 'AVAILABLE',
            reason: 'reservation_expired_job',
          },
        });
      }
    }
    if (expired.length) {
      this.logger.log(`Expired ${expired.length} reservation(s).`);
    }
  }

  // Daily 07:00: documents expiring soon + expired.
  @Cron('0 7 * * *')
  async checkDocuments() {
    const alertDays = this.config.get<number>(
      'business.docExpiryAlertDays',
      30,
    );
    const until = new Date(Date.now() + alertDays * 24 * 60 * 60 * 1000);

    const expiring = await this.prisma.document.findMany({
      where: {
        expiryDate: { gte: new Date(), lte: until },
        status: { in: ['APPROVED', 'RECEIVED', 'UNDER_REVIEW'] },
      },
      include: {
        documentType: true,
        vehicle: { select: { brand: true, model: true } },
      },
    });
    for (const doc of expiring) {
      this.realtime.emit(
        EVENTS.DOCUMENT_EXPIRING,
        { documentId: doc.id, expiryDate: doc.expiryDate },
        { roles: ['ADMIN', 'SELLER'] },
      );
    }

    // Mark expired.
    const expired = await this.prisma.document.updateMany({
      where: { expiryDate: { lt: new Date() }, status: { not: 'EXPIRED' } },
      data: { status: 'EXPIRED' },
    });
    this.logger.log(
      `Documents: ${expiring.length} expiring, ${expired.count} marked expired.`,
    );
  }

  // Daily 07:30: future revisions reminder.
  @Cron('30 7 * * *')
  async checkFutureRevisions() {
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const revisions = await this.prisma.maintenance.findMany({
      where: { nextRevisionDate: { gte: new Date(), lte: in7 } },
      include: { vehicle: { select: { brand: true, model: true } } },
    });
    for (const r of revisions) {
      this.realtime.emit(
        EVENTS.MAINTENANCE_CREATED,
        {
          maintenanceId: r.id,
          nextRevisionDate: r.nextRevisionDate,
          upcoming: true,
        },
        { roles: ['ADMIN'] },
      );
    }
  }

  // Daily 08:00: low stock parts alert + notify admins.
  @Cron('0 8 * * *')
  async checkLowStockParts() {
    const parts = await this.prisma.part.findMany({
      where: { status: 'ACTIVE' },
    });
    const low = parts.filter((p) => p.quantity <= p.minQuantity);
    if (!low.length) return;

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true, email: true },
    });
    for (const part of low) {
      this.realtime.emit(
        EVENTS.PART_STOCK_LOW,
        { partId: part.id, quantity: part.quantity },
        { roles: ['ADMIN'] },
      );
      for (const admin of admins) {
        await this.notifications.create({
          userId: admin.id,
          type: EVENTS.PART_STOCK_LOW,
          title: 'Estoque mínimo de peça',
          body: `${part.name}: ${part.quantity}/${part.minQuantity}`,
          data: { partId: part.id },
        });
      }
    }
  }

  // Daily 03:00: clean up expired/revoked tokens.
  @Cron('0 3 * * *')
  async cleanupTokens() {
    const now = new Date();
    const [refresh, reset] = await Promise.all([
      this.prisma.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }],
        },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }],
        },
      }),
    ]);
    this.logger.log(
      `Token cleanup: ${refresh.count} refresh, ${reset.count} reset removed.`,
    );
  }

  // Daily 04:00: process LGPD deletion requests (anonymize personal data).
  @Cron('0 4 * * *')
  async processPrivacyDeletions() {
    const requests = await this.prisma.privacyRequest.findMany({
      where: { type: 'DELETE', status: 'PENDING' },
    });
    for (const req of requests) {
      await this.prisma.$transaction(async (tx) => {
        const anonId = `ANON-${req.customerId.slice(0, 8)}`;
        await tx.customer.update({
          where: { id: req.customerId },
          data: {
            fullName: 'Cliente anonimizado',
            document: anonId,
            email: null,
            phone: null,
            whatsapp: null,
            birthDate: null,
            marketingConsent: false,
            anonymizedAt: new Date(),
          },
        });
        await tx.address.deleteMany({ where: { customerId: req.customerId } });
        await tx.privacyRequest.update({
          where: { id: req.id },
          data: { status: 'COMPLETED', processedAt: new Date() },
        });
        // Disable the linked user account, if any.
        const customer = await tx.customer.findUnique({
          where: { id: req.customerId },
          select: { userId: true },
        });
        if (customer?.userId) {
          await tx.user.update({
            where: { id: customer.userId },
            data: { status: 'INACTIVE' },
          });
        }
      });
      this.logger.log(`Anonymized customer ${req.customerId} (LGPD).`);
    }
  }
}
