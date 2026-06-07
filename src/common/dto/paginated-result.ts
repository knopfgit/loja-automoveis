import { PaginationMeta } from '../interfaces/api-response.interface';

/**
 * Wrapper returned by services for list endpoints. The ResponseInterceptor
 * detects this type and emits the standardized list envelope with meta.
 */
export class PaginatedResult<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}

  get meta(): Omit<PaginationMeta, 'timestamp'> {
    return {
      page: this.page,
      limit: this.limit,
      total: this.total,
      totalPages: Math.max(1, Math.ceil(this.total / this.limit)),
    };
  }

  static of<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return new PaginatedResult(items, total, page, limit);
  }
}
