"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppException = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../errors/error-codes");
class AppException extends common_1.HttpException {
    constructor(errorCode, messageOverride, details) {
        const def = error_codes_1.ERROR_CODES[errorCode];
        super({
            code: def.code,
            message: messageOverride ?? def.message,
            details: details ?? [],
        }, def.status);
        this.code = def.code;
        this.details = details;
    }
}
exports.AppException = AppException;
//# sourceMappingURL=app.exception.js.map