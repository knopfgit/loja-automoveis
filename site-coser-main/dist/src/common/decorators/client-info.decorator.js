"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInfoParam = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const hashIp = (ip) => (0, crypto_1.createHash)('sha256').update(ip).digest('hex').slice(0, 32);
exports.ClientInfoParam = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || '').trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return { ip, ipHash: hashIp(ip), userAgent };
});
//# sourceMappingURL=client-info.decorator.js.map