import { HttpException } from '@nestjs/common';
import { ERROR_CODES, ErrorCode } from '../errors/error-codes';

/**
 * Domain exception carrying a stable machine-readable error code.
 * Serialized by AllExceptionsFilter into the standard error envelope.
 */
export class AppException extends HttpException {
  public readonly code: string;
  public readonly details?: unknown[];

  constructor(
    errorCode: ErrorCode,
    messageOverride?: string,
    details?: unknown[],
  ) {
    const def = ERROR_CODES[errorCode];
    super(
      {
        code: def.code,
        message: messageOverride ?? def.message,
        details: details ?? [],
      },
      def.status,
    );
    this.code = def.code;
    this.details = details;
  }
}
