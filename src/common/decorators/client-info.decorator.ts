import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { createHash } from 'crypto';

export interface ClientInfo {
  ip: string;
  ipHash: string; // privacy-safe hash of the IP (LGPD-friendly)
  userAgent: string;
}

const hashIp = (ip: string): string =>
  createHash('sha256').update(ip).digest('hex').slice(0, 32);

/**
 * Extracts request client metadata for auditing and consent logging.
 * Stores only a hashed IP where privacy matters (see CookieConsent/VehicleView).
 */
export const ClientInfoParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClientInfo => {
    const req = ctx.switchToHttp().getRequest();
    const ip =
      (req.headers['x-forwarded-for']?.toString().split(',')[0] || '').trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return { ip, ipHash: hashIp(ip), userAgent };
  },
);
