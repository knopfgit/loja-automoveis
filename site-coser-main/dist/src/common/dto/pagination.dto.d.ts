export declare class PaginationQueryDto {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    get skip(): number;
}
