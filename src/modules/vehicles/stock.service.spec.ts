import { StockService } from './stock.service';

describe('StockService.isTransitionAllowed', () => {
  // Pure transition logic — dependencies are not used by this method.
  const service = new StockService(null as any, null as any, null as any);

  it('allows valid transitions', () => {
    expect(service.isTransitionAllowed('AVAILABLE', 'RESERVED')).toBe(true);
    expect(service.isTransitionAllowed('AVAILABLE', 'SOLD')).toBe(true);
    expect(service.isTransitionAllowed('RESERVED', 'AVAILABLE')).toBe(true);
    expect(service.isTransitionAllowed('SOLD', 'DELIVERED')).toBe(true);
  });

  it('allows no-op (same status)', () => {
    expect(service.isTransitionAllowed('AVAILABLE', 'AVAILABLE')).toBe(true);
  });

  it('blocks nonsensical transitions', () => {
    expect(service.isTransitionAllowed('DELIVERED', 'SOLD')).toBe(false);
    expect(service.isTransitionAllowed('ARCHIVED', 'SOLD')).toBe(false);
    expect(service.isTransitionAllowed('DRAFT', 'SOLD')).toBe(false);
  });
});
