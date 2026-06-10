"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const paginated_result_1 = require("../../common/dto/paginated-result");
const br_document_util_1 = require("../../common/validators/br-document.util");
let EmployeesService = class EmployeesService {
    constructor(prisma, config, audit) {
        this.prisma = prisma;
        this.config = config;
        this.audit = audit;
    }
    async create(dto, actorId) {
        const email = dto.email.toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new app_exception_1.AppException('EMAIL_ALREADY_USED');
        const rounds = this.config.get('security.bcryptSaltRounds', 10);
        const passwordHash = await bcrypt.hash(dto.password, rounds);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                role: dto.role,
                employee: {
                    create: {
                        fullName: dto.fullName,
                        cpf: (0, br_document_util_1.onlyDigits)(dto.cpf),
                        email,
                        phone: dto.phone,
                        whatsapp: dto.whatsapp,
                        position: dto.position,
                        admissionDate: dto.admissionDate
                            ? new Date(dto.admissionDate)
                            : undefined,
                        pixKey: dto.pixKey,
                        internalNotes: dto.internalNotes,
                        defaultCommissionRuleId: dto.defaultCommissionRuleId,
                    },
                },
            },
            include: { employee: true },
        });
        await this.audit.log({
            actorId,
            action: 'CREATE',
            entity: 'Employee',
            entityId: user.employee?.id,
            after: { email, role: dto.role, fullName: dto.fullName },
        });
        const { passwordHash: _omit, ...safeUser } = user;
        return safeUser;
    }
    async findAll(pg, active) {
        const where = active === undefined ? {} : { active };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.employee.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, role: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: pg.skip,
                take: pg.limit,
            }),
            this.prisma.employee.count({ where }),
        ]);
        return paginated_result_1.PaginatedResult.of(items, total, pg.page, pg.limit);
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, role: true, status: true } },
                defaultCommissionRule: true,
            },
        });
        if (!employee)
            throw new app_exception_1.AppException('EMPLOYEE_NOT_FOUND');
        return employee;
    }
    async update(id, dto, actorId) {
        const employee = await this.findOne(id);
        const data = {
            fullName: dto.fullName,
            cpf: dto.cpf ? (0, br_document_util_1.onlyDigits)(dto.cpf) : undefined,
            phone: dto.phone,
            whatsapp: dto.whatsapp,
            position: dto.position,
            admissionDate: dto.admissionDate
                ? new Date(dto.admissionDate)
                : undefined,
            pixKey: dto.pixKey,
            internalNotes: dto.internalNotes,
            active: dto.active,
            defaultCommissionRule: dto.defaultCommissionRuleId
                ? { connect: { id: dto.defaultCommissionRuleId } }
                : undefined,
        };
        const updated = await this.prisma.employee.update({ where: { id }, data });
        if (dto.role || dto.active !== undefined) {
            await this.prisma.user.update({
                where: { id: employee.userId },
                data: {
                    role: dto.role,
                    status: dto.active === false ? 'INACTIVE' : undefined,
                },
            });
        }
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'Employee',
            entityId: id,
            before: employee,
            after: updated,
        });
        return updated;
    }
    async deactivate(id, actorId) {
        const employee = await this.findOne(id);
        await this.prisma.$transaction([
            this.prisma.employee.update({ where: { id }, data: { active: false } }),
            this.prisma.user.update({
                where: { id: employee.userId },
                data: { status: 'INACTIVE' },
            }),
        ]);
        await this.audit.log({
            actorId,
            action: 'UPDATE',
            entity: 'Employee',
            entityId: id,
            reason: 'deactivated',
        });
        return { id, active: false };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map