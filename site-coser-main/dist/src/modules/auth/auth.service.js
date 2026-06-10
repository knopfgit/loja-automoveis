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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const br_document_util_1 = require("../../common/validators/br-document.util");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, audit, notifications) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.audit = audit;
        this.notifications = notifications;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async hashPassword(plain) {
        const rounds = this.config.get('security.bcryptSaltRounds', 10);
        return bcrypt.hash(plain, rounds);
    }
    async loadProfileIds(userId) {
        const [employee, customer] = await this.prisma.$transaction([
            this.prisma.employee.findUnique({
                where: { userId },
                select: { id: true },
            }),
            this.prisma.customer.findUnique({
                where: { userId },
                select: { id: true },
            }),
        ]);
        return {
            employeeId: employee?.id ?? null,
            customerId: customer?.id ?? null,
        };
    }
    async issueTokens(user, profile, client) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            employeeId: profile.employeeId,
            customerId: profile.customerId,
        };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('jwt.accessSecret'),
            expiresIn: this.config.get('jwt.accessExpiresIn'),
        });
        const refreshTokenRaw = (0, crypto_1.randomBytes)(48).toString('hex');
        const refreshToken = await this.jwt.signAsync({ sub: user.id, jti: refreshTokenRaw }, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: this.config.get('jwt.refreshExpiresIn'),
        });
        const decoded = this.jwt.decode(refreshToken);
        const expiresAt = new Date((decoded?.exp ?? 0) * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: this.hashToken(refreshToken),
                userAgent: client?.userAgent,
                ipAddress: client?.ipHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: this.config.get('jwt.accessExpiresIn'),
        };
    }
    sanitizeUser(user) {
        const { passwordHash: _omit, ...rest } = user;
        return rest;
    }
    async register(dto, client) {
        const email = dto.email.toLowerCase();
        const document = (0, br_document_util_1.onlyDigits)(dto.document);
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new app_exception_1.AppException('EMAIL_ALREADY_USED');
        const passwordHash = await this.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                role: client_1.UserRole.CUSTOMER,
                customer: {
                    create: {
                        fullName: dto.fullName,
                        document,
                        personType: document.length === 14 ? 'COMPANY' : 'INDIVIDUAL',
                        email,
                        phone: dto.phone,
                        whatsapp: dto.whatsapp,
                    },
                },
            },
        });
        await this.audit.log({
            actorId: user.id,
            action: 'CREATE',
            entity: 'User',
            entityId: user.id,
            source: 'api',
            ipAddress: client?.ipHash,
            userAgent: client?.userAgent,
        });
        await this.notifications.queueEmail(email, 'Bem-vindo(a)', 'welcome', {
            name: dto.fullName,
        });
        const profile = await this.loadProfileIds(user.id);
        const tokens = await this.issueTokens(user, profile, client);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto, client) {
        const email = dto.email.toLowerCase();
        const user = await this.prisma.user.findUnique({ where: { email } });
        const maxAttempts = this.config.get('security.loginMaxAttempts', 5);
        const lockMinutes = this.config.get('security.loginLockMinutes', 15);
        if (!user) {
            throw new app_exception_1.AppException('INVALID_CREDENTIALS');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new app_exception_1.AppException('ACCOUNT_LOCKED');
        }
        if (user.status !== 'ACTIVE') {
            throw new app_exception_1.AppException('ACCOUNT_INACTIVE');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            const attempts = user.failedLoginAttempts + 1;
            const lock = attempts >= maxAttempts
                ? new Date(Date.now() + lockMinutes * 60_000)
                : null;
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: attempts, lockedUntil: lock },
            });
            await this.prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    success: false,
                    ipAddress: client?.ipHash,
                    userAgent: client?.userAgent,
                    reason: 'invalid_password',
                },
            });
            throw new app_exception_1.AppException(lock ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
        await this.prisma.loginHistory.create({
            data: {
                userId: user.id,
                success: true,
                ipAddress: client?.ipHash,
                userAgent: client?.userAgent,
            },
        });
        await this.audit.log({
            actorId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            ipAddress: client?.ipHash,
            userAgent: client?.userAgent,
        });
        const profile = await this.loadProfileIds(user.id);
        const tokens = await this.issueTokens(user, profile, client);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refresh(refreshToken, client) {
        let decoded;
        try {
            decoded = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.get('jwt.refreshSecret'),
            });
        }
        catch {
            throw new app_exception_1.AppException('INVALID_REFRESH_TOKEN');
        }
        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!stored ||
            stored.revokedAt ||
            stored.expiresAt < new Date() ||
            stored.userId !== decoded.sub) {
            throw new app_exception_1.AppException('INVALID_REFRESH_TOKEN');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: stored.userId },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new app_exception_1.AppException('ACCOUNT_INACTIVE');
        }
        const profile = await this.loadProfileIds(user.id);
        const tokens = await this.issueTokens(user, profile, client);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        await this.audit.log({
            actorId: userId,
            action: 'LOGOUT',
            entity: 'User',
            entityId: userId,
            reason: 'logout_all_sessions',
        });
        return { success: true };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user)
            return { success: true };
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresMin = this.config.get('jwt.passwordResetExpiresMin', 30);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: this.hashToken(rawToken),
                expiresAt: new Date(Date.now() + expiresMin * 60_000),
            },
        });
        await this.notifications.queueEmail(user.email, 'Redefinição de senha', 'password-reset', { token: rawToken, expiresMin });
        return { success: true };
    }
    async resetPassword(dto) {
        const tokenHash = this.hashToken(dto.token);
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            throw new app_exception_1.AppException('INVALID_RESET_TOKEN');
        }
        const passwordHash = await this.hashPassword(dto.newPassword);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId: record.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);
        await this.audit.log({
            actorId: record.userId,
            action: 'UPDATE',
            entity: 'User',
            entityId: record.userId,
            reason: 'password_reset',
        });
        return { success: true };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new app_exception_1.AppException('NOT_FOUND');
        const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!valid)
            throw new app_exception_1.AppException('INVALID_CREDENTIALS', 'Senha atual incorreta.');
        const passwordHash = await this.hashPassword(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await this.audit.log({
            actorId: userId,
            action: 'UPDATE',
            entity: 'User',
            entityId: userId,
            reason: 'password_change',
        });
        return { success: true };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: true,
                customer: { include: { addresses: true } },
            },
        });
        if (!user)
            throw new app_exception_1.AppException('NOT_FOUND');
        return this.sanitizeUser(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map