export interface StoredFile {
    key: string;
    url: string;
    size: number;
    mimeType: string;
    originalName: string;
}
export interface SaveFileInput {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder?: string;
}
export interface StorageProvider {
    save(input: SaveFileInput): Promise<StoredFile>;
    delete(key: string): Promise<void>;
    resolve(key: string): Promise<string>;
    exists(key: string): Promise<boolean>;
}
export declare const STORAGE_PROVIDER = "STORAGE_PROVIDER";
