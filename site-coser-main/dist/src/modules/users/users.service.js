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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
let UsersService = class UsersService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(pg, role, status) {
        const where = { role, status };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                    employee: { select: { id: true, fullName: true } },
                    customer: { select: { id: true, fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async setStatus(id, status, actorId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new app_exception_1.AppException('NOT_FOUND');
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status },
        });
        if (status !== 'ACTIVE') {
            await this.prisma.refreshToken.updateMany({
                where: { userId: id, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'User',
            entityId: id,
            before: { status: user.status },
            after: { status },
            reason: 'status_change',
        });
        return { id: updated.id, status: updated.status };
    }
    async assignRoleProfile(id, roleProfileId, actorId) {
        const updated = await this.prisma.user.update({
            where: { id },
            data: { roleProfileId },
        });
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'User',
            entityId: id,
            reason: 'role_profile_assigned',
            after: { roleProfileId },
        });
        return { id: updated.id, roleProfileId: updated.roleProfileId };
    }
    async loginHistory(id, pg) {
        const where = { userId: id };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.loginHistory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.loginHistory.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map