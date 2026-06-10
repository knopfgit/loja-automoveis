"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.publicCode = publicCode;
exports.safeFileName = safeFileName;
const crypto_1 = require("crypto");
function slugify(input) {
    return (input || '')
        .toString()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
function publicCode(prefix = 'VEI') {
    const token = (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase().slice(0, 6);
    return `${prefix}-${token}`;
}
function safeFileName(originalName) {
    const dot = originalName.lastIndexOf('.');
    const ext = dot >= 0 ? originalName.slice(dot).toLowerCase() : '';
    const random = (0, crypto_1.randomBytes)(16).toString('hex');
    return `${Date.now()}-${random}${ext.replace(/[^a-z0-9.]/g, '')}`;
}
//# sourceMappingURL=string.util.js.map