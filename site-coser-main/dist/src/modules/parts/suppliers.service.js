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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const br_document_util_1 = require("../../common/validators/br-document.util");
let SuppliersService = class SuppliersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.supplier.create({
            data: {
                ...dto,
                document: dto.document ? (0, br_document_util_1.onlyDigits)(dto.document) : undefined,
            },
        });
    }
    async findAll(pg) {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.supplier.findMany({
                orderBy: { name: 'asc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.supplier.count(),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier)
            throw new app_exception_1.AppException('NOT_FOUND', 'Fornecedor não encontrado.');
        return supplier;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.supplier.update({
            where: { id },
            data: {
                ...dto,
                document: dto.document ? (0, br_document_util_1.onlyDigits)(dto.document) : undefined,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.supplier.update({
            where: { id },
            data: { active: false },
        });
        return { success: true };
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map