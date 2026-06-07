import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { safeFileName } from '../common/utils/string.util';
import {
  SaveFileInput,
  StorageProvider,
  StoredFile,
} from './storage.interface';

/**
 * Local filesystem storage used in development. Files are written under
 * STORAGE_LOCAL_PATH and served statically under /uploads.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    this.basePath = path.resolve(
      config.get<string>('storage.localPath', './storage'),
    );
    this.publicUrl = config.get<string>(
      'app.publicUrl',
      'http://localhost:3000',
    );
  }

  async save(input: SaveFileInput): Promise<StoredFile> {
    const folder = input.folder || 'misc';
    const fileName = safeFileName(input.originalName);
    const dir = path.join(this.basePath, folder);
    await fs.mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, fileName);
    await fs.writeFile(fullPath, input.buffer);

    const key = `${folder}/${fileName}`;
    return {
      key,
      url: `${this.publicUrl}/uploads/${key}`,
      size: input.buffer.length,
      mimeType: input.mimeType,
      originalName: input.originalName,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.basePath, key));
    } catch {
      // ignore missing files
    }
  }

  async resolve(key: string): Promise<string> {
    return path.join(this.basePath, key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.basePath, key));
      return true;
    } catch {
      return false;
    }
  }
}
