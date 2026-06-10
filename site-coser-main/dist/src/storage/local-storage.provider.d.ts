import { ConfigService } from '@nestjs/config';
import { SaveFileInput, StorageProvider, StoredFile } from './storage.interface';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly basePath;
    private readonly publicUrl;
    constructor(config: ConfigService);
    save(input: SaveFileInput): Promise<StoredFile>;
    delete(key: string): Promise<void>;
    resolve(key: string): Promise<string>;
    exists(key: string): Promise<boolean>;
}
