import { PaginationMeta } from '../interfaces/api-response.interface';
export declare class PaginatedResult<T> {
    readonly items: T[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    constructor(items: T[], total: number, page: number, limit: number);
    get meta(): Omit<PaginationMeta, 'timestamp'>;
    static of<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T>;
}
