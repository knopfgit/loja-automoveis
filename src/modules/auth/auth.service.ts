import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppException } from '../../common/exceptions/app.exception';
import { onlyDigits } from '../../common/validators/br-document.util';
import { ClientInfo } from '../../common/decorators/client-info.decorator';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------------------------------------------------------- helpers
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async hashPassword(plain: string): Promise<string> {
    const rounds = this.config.get<number>('security.bcryptSaltRounds', 10);
    return bcrypt.hash(plain, rounds);
  }

  private async loadProfileIds(userId: string) {
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

  private async issueTokens(
    user: Pick<User, 'id' | 'email' | 'role'>,
    profile: { employeeId: string | null; customerId: string | null },
    client?: ClientInfo,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: profile.employeeId,
      customerId: profile.customerId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });

    const refreshTokenRaw = randomBytes(48).toString('hex');
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: refreshTokenRaw },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      },
    );

    // Persist a hash of the refresh token so sessions are revocable.
    const decoded: any = this.jwt.decode(refreshToken);
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
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    };
  }

  private sanitizeUser(user: User) {
    const { passwordHash: _omit, ...rest } = user;
    return rest;
  }

  // ---------------------------------------------------------------- register
  async register(dto: RegisterDto, client?: ClientInfo) {
    const email = dto.email.toLowerCase();
    const document = onlyDigits(dto.document);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppException('EMAIL_ALREADY_USED');

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
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

  // ---------------------------------------------------------------- login
  async login(dto: LoginDto, client?: ClientInfo) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const maxAttempts = this.config.get<number>('security.loginMaxAttempts', 5);
    const lockMinutes = this.config.get<number>(
      'security.loginLockMinutes',
      15,
    );

    if (!user) {
      throw new AppException('INVALID_CREDENTIALS');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppException('ACCOUNT_LOCKED');
    }
    if (user.status !== 'ACTIVE') {
      throw new AppException('ACCOUNT_INACTIVE');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const lock =
        attempts >= maxAttempts
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
      throw new AppException(lock ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS');
    }

    // success: reset counters
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

  // ---------------------------------------------------------------- refresh
  async refresh(refreshToken: string, client?: ClientInfo) {
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new AppException('INVALID_REFRESH_TOKEN');
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.userId !== decoded.sub
    ) {
      throw new AppException('INVALID_REFRESH_TOKEN');
    }

    // Rotate: revoke the old token.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new AppException('ACCOUNT_INACTIVE');
    }

    const profile = await this.loadProfileIds(user.id);
    const tokens = await this.issueTokens(user, profile, client);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ---------------------------------------------------------------- logout
  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async logoutAll(userId: string) {
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

  // ---------------------------------------------------------- password reset
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    // Always respond success to avoid user enumeration.
    if (!user) return { success: true };

    const rawToken = randomBytes(32).toString('hex');
    const expiresMin = this.config.get<number>(
      'jwt.passwordResetExpiresMin',
      30,
    );
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + expiresMin * 60_000),
      },
    });

    await this.notifications.queueEmail(
      user.email,
      'Redefinição de senha',
      'password-reset',
      { token: rawToken, expiresMin },
    );

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppException('INVALID_RESET_TOKEN');
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
      // Invalidate all sessions on password change.
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppException('NOT_FOUND');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid)
      throw new AppException('INVALID_CREDENTIALS', 'Senha atual incorreta.');

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

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        customer: { include: { addresses: true } },
      },
    });
    if (!user) throw new AppException('NOT_FOUND');
    return this.sanitizeUser(user as User & Record<string, any>);
  }
}
