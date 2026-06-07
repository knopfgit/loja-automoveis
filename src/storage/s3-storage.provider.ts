import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SaveFileInput,
  StorageProvider,
  StoredFile,
} from './storage.interface';

/**
 * S3-compatible storage provider scaffold.
 *
 * This implementation is intentionally dependency-free so the project installs
 * and builds without AWS packages. To enable it in production:
 *   1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   2. Uncomment the AWS SDK usage below.
 *   3. Set STORAGE_DRIVER=s3 and the S3_* env vars.
 *
 * The public StorageProvider contract is identical to LocalStorageProvider,
 * so no calling code needs to change when switching drivers.
 */
@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly bucket?: string;
  private readonly publicUrl?: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('storage.s3.bucket');
    this.publicUrl = config.get<string>('storage.s3.publicUrl');
    this.logger.warn(
      'S3StorageProvider is a scaffold. Install @aws-sdk/client-s3 and ' +
        'implement the methods before using STORAGE_DRIVER=s3 in production.',
    );
  }

  async save(_input: SaveFileInput): Promise<StoredFile> {
    throw new Error(
      'S3StorageProvider.save not implemented. See file header for setup.',
    );
  }

  async delete(_key: string): Promise<void> {
    throw new Error('S3StorageProvider.delete not implemented.');
  }

  async resolve(key: string): Promise<string> {
    // In a real implementation, return a presigned URL.
    return `${this.publicUrl ?? ''}/${key}`;
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error('S3StorageProvider.exists not implemented.');
  }
}
