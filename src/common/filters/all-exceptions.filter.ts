import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../errors/error-codes';

/**
 * Global filter that serializes every error into the standard error envelope:
 *   { success: false, error: { code, message, details }, meta: { timestamp } }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_ERROR.code;
    let message: string = ERROR_CODES.INTERNAL_ERROR.message;
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.codeFromStatus(status);
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, any>;
        // AppException shape
        if (r.code) {
          code = r.code;
          message = r.message ?? message;
          details = r.details ?? [];
        } else {
          // class-validator / Nest default shape
          code = this.codeFromStatus(status);
          message = Array.isArray(r.message)
            ? 'Erro de validação.'
            : (r.message ?? message);
          if (Array.isArray(r.message)) {
            details = r.message;
          }
        }
      }
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? ERROR_CODES.INTERNAL_ERROR.message
          : exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
      meta: { timestamp, path: request.url },
    });
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR.code;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED.code;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN.code;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND.code;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.CONFLICT.code;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMITED.code;
      default:
        return ERROR_CODES.INTERNAL_ERROR.code;
    }
  }
}
