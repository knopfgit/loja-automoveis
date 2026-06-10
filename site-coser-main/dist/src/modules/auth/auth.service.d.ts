import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ClientInfo } from '../../common/decorators/client-info.decorator';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly audit;
    private readonly notifications;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, audit: AuditService, notifications: NotificationsService);
    private hashToken;
    private hashPassword;
    private loadProfileIds;
    private issueTokens;
    private sanitizeUser;
    register(dto: RegisterDto, client?: ClientInfo): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            roleProfileId: string | null;
        };
    }>;
    login(dto: LoginDto, client?: ClientInfo): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            roleProfileId: string | null;
        };
    }>;
    refresh(refreshToken: string, client?: ClientInfo): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            roleProfileId: string | null;
        };
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    logoutAll(userId: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    me(userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
        lastLoginAt: Date | null;
        roleProfileId: string | null;
    }>;
}
