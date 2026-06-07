import { toCsv } from './csv.util';

describe('toCsv', () => {
  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('');
  });

  it('serializes rows with header from union of keys', () => {
    const csv = toCsv([
      { a: 1, b: 'x' },
      { a: 2, c: true },
    ]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('a,b,c');
    expect(lines[1]).toBe('1,x,');
    expect(lines[2]).toBe('2,,true');
  });

  it('escapes commas, quotes and newlines', () => {
    const csv = toCsv([{ name: 'Silva, João "Jr"' }]);
    expect(csv.split('\n')[1]).toBe('"Silva, João ""Jr"""');
  });
});
