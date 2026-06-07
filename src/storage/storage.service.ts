import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '../common/exceptions/app.exception';
import {
  SaveFileInput,
  STORAGE_PROVIDER,
  StorageProvider,
  StoredFile,
} from './storage.interface';

/**
 * Facade over the configured StorageProvider. Validates MIME type and size
 * before delegating to the driver.
 */
@Injectable()
export class StorageService {
  private readonly maxSize: number;
  private readonly allowedMime: string[];

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
    config: ConfigService,
  ) {
    this.maxSize = config.get<number>('storage.maxSize', 10485760);
    this.allowedMime = config.get<string[]>('storage.allowedMime', []);
  }

  validate(file: { mimetype: string; size: number }): void {
    if (this.allowedMime.length && !this.allowedMime.includes(file.mimetype)) {
      throw new AppException(
        'UPLOAD_INVALID_TYPE',
        `Tipo de arquivo não permitido: ${file.mimetype}.`,
      );
    }
    if (file.size > this.maxSize) {
      throw new AppException('UPLOAD_TOO_LARGE');
    }
  }

  async save(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    folder?: string,
  ): Promise<StoredFile> {
    this.validate(file);
    const input: SaveFileInput = {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder,
    };
    return this.provider.save(input);
  }

  delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }

  resolve(key: string): Promise<string> {
    return this.provider.resolve(key);
  }

  exists(key: string): Promise<boolean> {
    return this.provider.exists(key);
  }
}
