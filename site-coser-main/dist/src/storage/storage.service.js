"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_exception_1 = require("../common/exceptions/app.exception");
const storage_interface_1 = require("./storage.interface");
let StorageService = class StorageService {
    constructor(provider, config) {
        this.provider = provider;
        this.maxSize = config.get('storage.maxSize', 10485760);
        this.allowedMime = config.get('storage.allowedMime', []);
    }
    validate(file) {
        if (this.allowedMime.length && !this.allowedMime.includes(file.mimetype)) {
            throw new app_exception_1.AppException('UPLOAD_INVALID_TYPE', `Tipo de arquivo não permitido: ${file.mimetype}.`);
        }
        if (file.size > this.maxSize) {
            throw new app_exception_1.AppException('UPLOAD_TOO_LARGE');
        }
    }
    async save(file, folder) {
        this.validate(file);
        const input = {
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
            folder,
        };
        return this.provider.save(input);
    }
    delete(key) {
        return this.provider.delete(key);
    }
    resolve(key) {
        return this.provider.resolve(key);
    }
    exists(key) {
        return this.provider.exists(key);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map