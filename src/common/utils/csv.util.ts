/**
 * Minimal, dependency-free CSV serializer. Handles quoting, commas, quotes and
 * newlines. Values are derived from the union of keys across all rows.
 */
export function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headerSet = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => headerSet.add(k));
  }
  const headers = Array.from(headerSet);

  const escape = (value: any): string => {
    if (value === null || value === undefined) return '';
    let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/[",\n;]/.test(str)) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
