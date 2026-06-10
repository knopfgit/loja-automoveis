export interface AuthUser {
    userId: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
    employeeId?: string | null;
    customerId?: string | null;
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof AuthUser | undefined)[]) => ParameterDecorator;
