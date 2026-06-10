import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../common/decorators/current-user.decorator';
export interface JwtPayload {
    sub: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
    employeeId?: string | null;
    customerId?: string | null;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<AuthUser>;
}
export {};
