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
var S3StorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let S3StorageProvider = S3StorageProvider_1 = class S3StorageProvider {
    constructor(config) {
        this.logger = new common_1.Logger(S3StorageProvider_1.name);
        this.bucket = config.get('storage.s3.bucket');
        this.publicUrl = config.get('storage.s3.publicUrl');
        this.logger.warn('S3StorageProvider is a scaffold. Install @aws-sdk/client-s3 and ' +
            'implement the methods before using STORAGE_DRIVER=s3 in production.');
    }
    async save(_input) {
        throw new Error('S3StorageProvider.save not implemented. See file header for setup.');
    }
    async delete(_key) {
        throw new Error('S3StorageProvider.delete not implemented.');
    }
    async resolve(key) {
        return `${this.publicUrl ?? ''}/${key}`;
    }
    async exists(_key) {
        throw new Error('S3StorageProvider.exists not implemented.');
    }
};
exports.S3StorageProvider = S3StorageProvider;
exports.S3StorageProvider = S3StorageProvider = S3StorageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3StorageProvider);
//# sourceMappingURL=s3-storage.provider.js.map