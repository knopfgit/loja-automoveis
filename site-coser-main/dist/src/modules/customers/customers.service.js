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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const br_document_util_1 = require("../../common/validators/br-document.util");
let CustomersService = class CustomersService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(dto, actorId) {
        const document = (0, br_document_util_1.onlyDigits)(dto.document);
        const existing = await this.prisma.customer.findUnique({
            where: { document },
        });
        if (existing) {
            throw new app_exception_1.AppException('CONFLICT', 'Cliente com este documento já existe.');
        }
        const customer = await this.prisma.customer.create({
            data: {
                fullName: dto.fullName,
                document,
                personType: dto.personType ?? (document.length === 14 ? 'COMPANY' : 'INDIVIDUAL'),
                email: dto.email?.toLowerCase(),
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                marketingConsent: dto.marketingConsent ?? false,
                cookieConsent: dto.cookieConsent ?? false,
                addresses: dto.address
                    ? { create: { ...dto.address, isPrimary: true } }
                    : undefined,
            },
            include: { addresses: true },
        });
        await this.audit.log({
            actorId,
            action: 'CREATE',
            entity: 'Customer',
            entityId: customer.id,
            after: { fullName: dto.fullName },
        });
        return customer;
    }
    async findAll(pg, search) {
        const where = {
            anonymizedAt: null,
            ...(search
                ? {
                    OR: [
                        { fullName: { contains: search, mode: 'insensitive' } },
                        { document: { contains: (0, br_document_util_1.onlyDigits)(search) } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.customer.findMany({
                where,
                include: { addresses: true },
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.customer.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { addresses: true, marketingPreference: true },
        });
        if (!customer)
            throw new app_exception_1.AppException('CUSTOMER_NOT_FOUND');
        return customer;
    }
    async update(id, dto, actorId) {
        const before = await this.findOne(id);
        const updated = await this.prisma.customer.update({
            where: { id },
            data: {
                fullName: dto.fullName,
                document: dto.document ? (0, br_document_util_1.onlyDigits)(dto.document) : undefined,
                personType: dto.personType,
                email: dto.email?.toLowerCase(),
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                marketingConsent: dto.marketingConsent,
                cookieConsent: dto.cookieConsent,
            },
            include: { addresses: true },
        });
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'Customer',
            entityId: id,
            before,
            after: updated,
        });
        return updated;
    }
    async getMe(customerId) {
        return this.findOne(customerId);
    }
    async updateMe(customerId, dto) {
        return this.prisma.customer.update({
            where: { id: customerId },
            data: {
                fullName: dto.fullName,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                email: dto.email?.toLowerCase(),
                marketingConsent: dto.marketingConsent,
            },
            include: { addresses: true },
        });
    }
    async addAddress(customerId, dto) {
        await this.findOne(customerId);
        return this.prisma.address.create({
            data: { ...dto, customerId },
        });
    }
    async updateAddress(customerId, addressId, dto) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, customerId },
        });
        if (!address)
            throw new app_exception_1.AppException('NOT_FOUND', 'Endereço não encontrado.');
        return this.prisma.address.update({ where: { id: addressId }, data: dto });
    }
    async removeAddress(customerId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, customerId },
        });
        if (!address)
            throw new app_exception_1.AppException('NOT_FOUND', 'Endereço não encontrado.');
        await this.prisma.address.delete({ where: { id: addressId } });
        return { success: true };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map