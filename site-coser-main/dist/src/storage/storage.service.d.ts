import { ConfigService } from '@nestjs/config';
import { StorageProvider, StoredFile } from './storage.interface';
export declare class StorageService {
    private readonly provider;
    private readonly maxSize;
    private readonly allowedMime;
    constructor(provider: StorageProvider, config: ConfigService);
    validate(file: {
        mimetype: string;
        size: number;
    }): void;
    save(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }, folder?: string): Promise<StoredFile>;
    delete(key: string): Promise<void>;
    resolve(key: string): Promise<string>;
    exists(key: string): Promise<boolean>;
}
