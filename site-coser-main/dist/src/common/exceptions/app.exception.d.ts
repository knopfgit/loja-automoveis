import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../errors/error-codes';
export declare class AppException extends HttpException {
    readonly code: string;
    readonly details?: unknown[];
    constructor(errorCode: ErrorCode, messageOverride?: string, details?: unknown[]);
}
