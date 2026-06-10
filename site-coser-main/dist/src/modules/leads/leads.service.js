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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const realtime_service_1 = require("../../realtime/realtime.service");
const events_constants_1 = require("../../realtime/events.constants");
const notifications_service_1 = require("../notifications/notifications.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const br_document_util_1 = require("../../common/validators/br-document.util");
let LeadsService = class LeadsService {
    constructor(prisma, config, audit, realtime, notifications) {
        this.prisma = prisma;
        this.config = config;
        this.audit = audit;
        this.realtime = realtime;
        this.notifications = notifications;
    }
    async pickSeller() {
        const strategy = this.config.get('business.leadAssignmentStrategy', 'round_robin');
        const sellers = await this.prisma.employee.findMany({
            where: { active: true, user: { role: 'SELLER', status: 'ACTIVE' } },
            include: { user: { select: { id: true, email: true } } },
        });
        if (!sellers.length)
            return null;
        const openCounts = await Promise.all(sellers.map(async (s) => ({
            seller: s,
            open: await this.prisma.lead.count({
                where: {
                    assignedSellerId: s.id,
                    status: { in: ['NEW', 'ASSIGNED', 'CONTACTED', 'NEGOTIATING'] },
                },
            }),
            last: await this.prisma.lead.findFirst({
                where: { assignedSellerId: s.id },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            }),
        })));
        if (strategy === 'least_busy') {
            openCounts.sort((a, b) => a.open - b.open);
        }
        else {
            openCounts.sort((a, b) => {
                const at = a.last?.createdAt?.getTime() ?? 0;
                const bt = b.last?.createdAt?.getTime() ?? 0;
                return at - bt;
            });
        }
        return openCounts[0].seller;
    }
    buildWhatsappUrl(number, message) {
        const cc = this.config.get('business.whatsappCountryCode', '55');
        let digits = (0, br_document_util_1.onlyDigits)(number);
        if (!digits.startsWith(cc))
            digits = `${cc}${digits}`;
        return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    }
    async specialistContact(dto) {
        const vehicle = dto.vehicleId
            ? await this.prisma.vehicle.findUnique({
                where: { id: dto.vehicleId },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    modelYear: true,
                    publicCode: true,
                },
            })
            : null;
        const seller = await this.pickSeller();
        const store = await this.prisma.store.findFirst();
        const vehicleLabel = vehicle
            ? `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} (${vehicle.publicCode})`
            : 'um veículo';
        const message = dto.message || `Olá! Tenho interesse em ${vehicleLabel}. Pode me ajudar?`;
        const contactNumber = seller?.whatsapp || store?.whatsapp || store?.phone || '';
        const whatsappUrl = contactNumber
            ? this.buildWhatsappUrl(contactNumber, message)
            : null;
        const lead = await this.prisma.lead.create({
            data: {
                vehicleId: vehicle?.id,
                customerId: dto.customerId,
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                origin: dto.origin ?? 'SPECIALIST_BUTTON',
                sourcePage: dto.sourcePage,
                assignedSellerId: seller?.id,
                initialMessage: message,
                whatsappUrl: whatsappUrl ?? undefined,
                status: seller ? 'ASSIGNED' : 'NEW',
            },
        });
        if (vehicle) {
            await this.prisma.vehicle.update({
                where: { id: vehicle.id },
                data: { contactCount: { increment: 1 } },
            });
        }
        await this.audit.log({
            action: 'CREATE',
            entity: 'Lead',
            entityId: lead.id,
            source: 'api',
            after: { vehicleId: vehicle?.id, assignedSellerId: seller?.id },
        });
        this.realtime.emit(events_constants_1.EVENTS.LEAD_CREATED, { id: lead.id }, { roles: ['ADMIN'] });
        if (seller) {
            this.realtime.emit(events_constants_1.EVENTS.LEAD_ASSIGNED, { id: lead.id, vehicle: vehicleLabel }, { roles: ['ADMIN'], sellerId: seller.id });
            if (seller.user) {
                await this.notifications.create({
                    userId: seller.user.id,
                    type: events_constants_1.EVENTS.LEAD_ASSIGNED,
                    title: 'Nova oportunidade de atendimento',
                    body: `${dto.name} (${dto.phone}) - ${vehicleLabel}`,
                    data: { leadId: lead.id, vehicleId: vehicle?.id },
                    email: {
                        to: seller.user.email,
                        template: 'lead-assigned',
                        context: {
                            name: dto.name,
                            phone: dto.phone,
                            vehicle: vehicleLabel,
                        },
                    },
                });
            }
        }
        return {
            leadId: lead.id,
            assignedSeller: seller ? { id: seller.id, name: seller.fullName } : null,
            whatsappUrl,
            status: lead.status,
        };
    }
    async findAll(pg, filters) {
        const where = {
            status: filters.status,
            assignedSellerId: filters.sellerId,
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.lead.findMany({
                where,
                include: {
                    vehicle: { select: { brand: true, model: true, publicCode: true } },
                    assignedSeller: { select: { id: true, fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.lead.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id, user) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                interactions: { orderBy: { createdAt: 'desc' } },
                vehicle: true,
            },
        });
        if (!lead)
            throw new app_exception_1.AppException('LEAD_NOT_FOUND');
        if (user?.role === 'SELLER' && lead.assignedSellerId !== user.employeeId) {
            throw new app_exception_1.AppException('FORBIDDEN');
        }
        return lead;
    }
    async updateStatus(id, dto, actorId) {
        const lead = await this.prisma.lead.findUnique({ where: { id } });
        if (!lead)
            throw new app_exception_1.AppException('LEAD_NOT_FOUND');
        const data = {
            status: dto.status,
            notes: dto.notes,
        };
        if (dto.status === 'CONTACTED' && !lead.firstContactAt) {
            data.firstContactAt = new Date();
        }
        if (dto.status === 'CONVERTED')
            data.convertedAt = new Date();
        const updated = await this.prisma.lead.update({ where: { id }, data });
        await this.prisma.leadInteraction.create({
            data: {
                leadId: id,
                type: 'status_change',
                content: `Status -> ${dto.status}`,
                authorId: actorId,
            },
        });
        await this.audit.log({
            actorId,
            action: 'STATUS_CHANGE',
            entity: 'Lead',
            entityId: id,
            after: { status: dto.status },
        });
        return updated;
    }
    async addInteraction(id, dto, actorId) {
        await this.prisma.lead.findUniqueOrThrow({ where: { id } }).catch(() => {
            throw new app_exception_1.AppException('LEAD_NOT_FOUND');
        });
        return this.prisma.leadInteraction.create({
            data: {
                leadId: id,
                type: dto.type,
                content: dto.content,
                authorId: actorId,
            },
        });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        realtime_service_1.RealtimeService,
        notifications_service_1.NotificationsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map