import { ConfigService } from '@nestjs/config';
import { SaveFileInput, StorageProvider, StoredFile } from './storage.interface';
export declare class S3StorageProvider implements StorageProvider {
    private readonly logger;
    private readonly bucket?;
    private readonly publicUrl?;
    constructor(config: ConfigService);
    save(_input: SaveFileInput): Promise<StoredFile>;
    delete(_key: string): Promise<void>;
    resolve(key: string): Promise<string>;
    exists(_key: string): Promise<boolean>;
}
