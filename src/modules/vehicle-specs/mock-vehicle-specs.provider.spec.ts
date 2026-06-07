import { MockVehicleSpecsProvider } from './providers/mock-vehicle-specs.provider';

describe('MockVehicleSpecsProvider', () => {
  const provider = new MockVehicleSpecsProvider();

  it('lists brands', async () => {
    const brands = await provider.getBrands();
    expect(brands.some((b) => b.name === 'Volkswagen')).toBe(true);
  });

  it('lists models for a brand', async () => {
    const brands = await provider.getBrands();
    const vw = brands.find((b) => b.name === 'Volkswagen')!;
    const models = await provider.getModels(vw.id);
    expect(models.map((m) => m.name)).toContain('T-Cross');
  });

  it('returns years and versions for a model', async () => {
    const brands = await provider.getBrands();
    const vw = brands.find((b) => b.name === 'Volkswagen')!;
    const models = await provider.getModels(vw.id);
    const tcross = models.find((m) => m.name === 'T-Cross')!;
    const years = await provider.getYears(tcross.id);
    expect(years.length).toBeGreaterThan(0);
    const versions = await provider.getVersions(tcross.id, years[0]);
    expect(versions.length).toBeGreaterThan(0);
  });

  it('searches the technical spec by brand/model/year', async () => {
    const result = await provider.search({
      brand: 'Volkswagen',
      model: 'T-Cross',
      year: 2023,
    });
    expect(result).not.toBeNull();
    expect(result!.source).toBe('PROVIDER_MOCK');
    expect(result!.spec.engine).toBeDefined();
  });

  it('returns null for unknown vehicles (fallback to manual)', async () => {
    const result = await provider.search({
      brand: 'Unknown',
      model: 'Ghost',
      year: 2000,
    });
    expect(result).toBeNull();
  });
});
