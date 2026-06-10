"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResult = void 0;
class PaginatedResult {
    constructor(items, total, page, limit) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.limit = limit;
    }
    get meta() {
        return {
            page: this.page,
            limit: this.limit,
            total: this.total,
            totalPages: Math.max(1, Math.ceil(this.total / this.limit)),
        };
    }
    static of(items, total, page, limit) {
        return new PaginatedResult(items, total, page, limit);
    }
}
exports.PaginatedResult = PaginatedResult;
//# sourceMappingURL=paginated-result.js.map