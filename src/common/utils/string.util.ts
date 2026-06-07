import { randomBytes } from 'crypto';

/**
 * Generates a URL-friendly slug from arbitrary text.
 */
export function slugify(input: string): string {
  return (input || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generates a friendly public code, e.g. "VEI-7F3A2B".
 */
export function publicCode(prefix = 'VEI'): string {
  const token = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `${prefix}-${token}`;
}

/**
 * Produces a filesystem-safe filename keeping the original extension.
 */
export function safeFileName(originalName: string): string {
  const dot = originalName.lastIndexOf('.');
  const ext = dot >= 0 ? originalName.slice(dot).toLowerCase() : '';
  const random = randomBytes(16).toString('hex');
  return `${Date.now()}-${random}${ext.replace(/[^a-z0-9.]/g, '')}`;
}
