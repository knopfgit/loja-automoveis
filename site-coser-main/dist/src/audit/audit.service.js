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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_1 = require("../common/dto/paginated-result");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(entry) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    actorId: entry.actorId ?? null,
                    action: entry.action,
                    entity: entry.entity,
                    entityId: entry.entityId ?? null,
                    before: entry.before ?? undefined,
                    after: entry.after ?? undefined,
                    ipAddress: entry.ipAddress ?? null,
                    userAgent: entry.userAgent ?? null,
                    source: entry.source ?? 'api',
                    reason: entry.reason ?? null,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to write audit log for ${entry.entity}:${entry.entityId}`, err instanceof Error ? err.stack : String(err));
        }
    }
    async findMany(params) {
        const where = {
            entity: params.entity,
            entityId: params.entityId,
            actorId: params.actorId,
            action: params.action,
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, params.page, params.limit);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map