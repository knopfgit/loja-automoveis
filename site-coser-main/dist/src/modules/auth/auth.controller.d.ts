import { ClientInfo } from '../../common/decorators/client-info.decorator';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, client: ClientInfo): Promise<{
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
    login(dto: LoginDto, client: ClientInfo): Promise<{
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
    refresh(dto: RefreshTokenDto, client: ClientInfo): Promise<{
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
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
    }>;
    logoutAll(user: AuthUser): Promise<{
        success: boolean;
    }>;
    forgot(dto: ForgotPasswordDto): Promise<{
        success: boolean;
    }>;
    reset(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    me(user: AuthUser): Promise<{
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
