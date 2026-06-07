export interface StoredFile {
  key: string; // storage key/path used for retrieval/deletion
  url: string; // absolute/relative URL to access the file
  size: number;
  mimeType: string;
  originalName: string;
}

export interface SaveFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  /** logical folder, e.g. "vehicles", "documents" */
  folder?: string;
}

/**
 * Storage abstraction. Implementations: LocalStorageProvider (dev),
 * S3StorageProvider (future/production). Swappable via STORAGE_DRIVER.
 */
export interface StorageProvider {
  save(input: SaveFileInput): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  /** Returns an absolute filesystem path (local) or signed URL (s3). */
  resolve(key: string): Promise<string>;
  exists(key: string): Promise<boolean>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
