import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  employeeId?: string | null;
  customerId?: string | null;
}

/**
 * Injects the authenticated user (populated by JwtStrategy) into a handler.
 * Usage: methodName(@CurrentUser() user: AuthUser)
 *        methodName(@CurrentUser('userId') id: string)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
