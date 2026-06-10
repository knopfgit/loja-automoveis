"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../../mail/mail.service");
const redis_service_1 = require("../../redis/redis.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const notifications_service_1 = require("../notifications/notifications.service");
let JobsService = JobsService_1 = class JobsService {
    constructor(prisma, config, mail, redis, realtime, notifications) {
        this.prisma = prisma;
        this.config = config;
        this.mail = mail;
        this.redis = redis;
        this.realtime = realtime;
        this.notifications = notifications;
        this.logger = new common_1.Logger(JobsService_1.name);
    }
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
                    context: email.context ?? {},
                });
                await this.prisma.emailQueue.update({
                    where: { id: email.id },
                    data: { status: 'SENT', sentAt: new Date() },
                });
            }
            catch (err) {
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
    async recalcDashboards() {
        await this.redis.del('dashboard:admin');
        this.realtime.emit(events_constants_1.EVENTS.DASHBOARD_UPDATED, {
            at: new Date().toISOString(),
        });
    }
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
    async checkDocuments() {
        const alertDays = this.config.get('business.docExpiryAlertDays', 30);
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
            this.realtime.emit(events_constants_1.EVENTS.DOCUMENT_EXPIRING, { documentId: doc.id, expiryDate: doc.expiryDate }, { roles: ['ADMIN', 'SELLER'] });
        }
        const expired = await this.prisma.document.updateMany({
            where: { expiryDate: { lt: new Date() }, status: { not: 'EXPIRED' } },
            data: { status: 'EXPIRED' },
        });
        this.logger.log(`Documents: ${expiring.length} expiring, ${expired.count} marked expired.`);
    }
    async checkFutureRevisions() {
        const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const revisions = await this.prisma.maintenance.findMany({
            where: { nextRevisionDate: { gte: new Date(), lte: in7 } },
            include: { vehicle: { select: { brand: true, model: true } } },
        });
        for (const r of revisions) {
            this.realtime.emit(events_constants_1.EVENTS.MAINTENANCE_CREATED, {
                maintenanceId: r.id,
                nextRevisionDate: r.nextRevisionDate,
                upcoming: true,
            }, { roles: ['ADMIN'] });
        }
    }
    async checkLowStockParts() {
        const parts = await this.prisma.part.findMany({
            where: { status: 'ACTIVE' },
        });
        const low = parts.filter((p) => p.quantity <= p.minQuantity);
        if (!low.length)
            return;
        const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN', status: 'ACTIVE' },
            select: { id: true, email: true },
        });
        for (const part of low) {
            this.realtime.emit(events_constants_1.EVENTS.PART_STOCK_LOW, { partId: part.id, quantity: part.quantity }, { roles: ['ADMIN'] });
            for (const admin of admins) {
                await this.notifications.create({
                    userId: admin.id,
                    type: events_constants_1.EVENTS.PART_STOCK_LOW,
                    title: 'Estoque mínimo de peça',
                    body: `${part.name}: ${part.quantity}/${part.minQuantity}`,
                    data: { partId: part.id },
                });
            }
        }
    }
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
        this.logger.log(`Token cleanup: ${refresh.count} refresh, ${reset.count} reset removed.`);
    }
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
};
exports.JobsService = JobsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "processEmailQueue", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "recalcDashboards", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "expireReservations", null);
__decorate([
    (0, schedule_1.Cron)('0 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "checkDocuments", null);
__decorate([
    (0, schedule_1.Cron)('30 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "checkFutureRevisions", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "checkLowStockParts", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "cleanupTokens", null);
__decorate([
    (0, schedule_1.Cron)('0 4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "processPrivacyDeletions", null);
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        mail_service_1.MailService,
        redis_service_1.RedisService,
        realtime_service_1.RealtimeService,
        notifications_service_1.NotificationsService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map