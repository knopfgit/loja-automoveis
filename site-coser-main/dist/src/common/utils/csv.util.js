"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCsv = toCsv;
function toCsv(rows) {
    if (!rows.length)
        return '';
    const headerSet = new Set();
    for (const row of rows) {
        Object.keys(row).forEach((k) => headerSet.add(k));
    }
    const headers = Array.from(headerSet);
    const escape = (value) => {
        if (value === null || value === undefined)
            return '';
        let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (/[",\n;]/.test(str)) {
            str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    const lines = [headers.join(',')];
    for (const row of rows) {
        lines.push(headers.map((h) => escape(row[h])).join(','));
    }
    return lines.join('\n');
}
//# sourceMappingURL=csv.util.js.map