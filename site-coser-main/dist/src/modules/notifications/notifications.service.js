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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const paginated_result_1 = require("../../common/dto/paginated-result");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title: input.title,
                body: input.body,
                data: input.data ?? undefined,
                channel: input.channel ?? client_1.NotificationChannel.IN_APP,
            },
        });
        if (input.email) {
            await this.queueEmail(input.email.to, input.title, input.email.template, input.email.context);
        }
        return notification;
    }
    async queueEmail(to, subject, template, context) {
        return this.prisma.emailQueue.create({
            data: {
                to,
                subject,
                template,
                context: context ?? undefined,
            },
        });
    }
    async listForUser(userId, page, limit) {
        const where = { userId };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, page, limit);
    }
    async unreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, status: 'UNREAD' },
        });
    }
    async markRead(userId, id) {
        await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { status: 'READ', readAt: new Date() },
        });
        return { id, status: 'READ' };
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, status: 'UNREAD' },
            data: { status: 'READ', readAt: new Date() },
        });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map