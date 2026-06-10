"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../errors/error-codes");
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger('Exception');
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const timestamp = new Date().toISOString();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = error_codes_1.ERROR_CODES.INTERNAL_ERROR.code;
        let message = error_codes_1.ERROR_CODES.INTERNAL_ERROR.message;
        let details = [];
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                code = this.codeFromStatus(status);
            }
            else if (typeof res === 'object' && res !== null) {
                const r = res;
                if (r.code) {
                    code = r.code;
                    message = r.message ?? message;
                    details = r.details ?? [];
                }
                else {
                    code = this.codeFromStatus(status);
                    message = Array.isArray(r.message)
                        ? 'Erro de validação.'
                        : (r.message ?? message);
                    if (Array.isArray(r.message)) {
                        details = r.message;
                    }
                }
            }
        }
        else if (exception instanceof Error) {
            message =
                process.env.NODE_ENV === 'production'
                    ? error_codes_1.ERROR_CODES.INTERNAL_ERROR.message
                    : exception.message;
        }
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.url} -> ${status} ${code}`, exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(status).json({
            success: false,
            error: { code, message, details },
            meta: { timestamp, path: request.url },
        });
    }
    codeFromStatus(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return error_codes_1.ERROR_CODES.VALIDATION_ERROR.code;
            case common_1.HttpStatus.UNAUTHORIZED:
                return error_codes_1.ERROR_CODES.UNAUTHORIZED.code;
            case common_1.HttpStatus.FORBIDDEN:
                return error_codes_1.ERROR_CODES.FORBIDDEN.code;
            case common_1.HttpStatus.NOT_FOUND:
                return error_codes_1.ERROR_CODES.NOT_FOUND.code;
            case common_1.HttpStatus.CONFLICT:
                return error_codes_1.ERROR_CODES.CONFLICT.code;
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return error_codes_1.ERROR_CODES.RATE_LIMITED.code;
            default:
                return error_codes_1.ERROR_CODES.INTERNAL_ERROR.code;
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map