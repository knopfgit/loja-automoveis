import { toPublicVehicle } from './vehicles.serializer';

describe('toPublicVehicle', () => {
  const internalVehicle = {
    id: 'v1',
    publicCode: 'VEI-ABC123',
    slug: 'vw-t-cross-2023',
    brand: 'Volkswagen',
    model: 'T-Cross',
    version: '200 TSI',
    modelYear: 2023,
    manufactureYear: 2022,
    status: 'AVAILABLE',
    announcedPrice: 119900,
    // INTERNAL fields that must never leak:
    purchasePrice: 95000,
    suggestedPrice: 120000,
    minPrice: 108000,
    soldPrice: 0,
    internalNotes: 'comprado de particular',
    plate: 'ABC1D23',
    renavam: '00123456789',
    chassis: '9BWZZZ377VT004251',
    engineNumber: 'XYZ',
    viewCount: 10,
    favoriteCount: 2,
    spec: {
      id: 'spec1',
      vehicleId: 'v1',
      engine: '1.0 TSI',
      source: 'PROVIDER_MOCK',
      fieldSources: { engine: 'MANUAL' },
      power: '128 cv',
    },
    media: [
      {
        url: 'a.jpg',
        published: true,
        position: 0,
        isMain: true,
        type: 'image',
      },
      { url: 'hidden.jpg', published: false, position: 1, isMain: false },
    ],
  };

  const result: any = toPublicVehicle(internalVehicle);

  it('exposes only the announced price as price', () => {
    expect(result.price).toBe(119900);
  });

  it('does NOT expose internal/commercial fields', () => {
    const keys = Object.keys(result);
    for (const forbidden of [
      'purchasePrice',
      'suggestedPrice',
      'minPrice',
      'soldPrice',
      'internalNotes',
      'plate',
      'renavam',
      'chassis',
      'engineNumber',
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('strips internal metadata from spec', () => {
    expect(result.spec).toBeDefined();
    expect(result.spec.engine).toBe('1.0 TSI');
    expect(result.spec.source).toBeUndefined();
    expect(result.spec.fieldSources).toBeUndefined();
    expect(result.spec.vehicleId).toBeUndefined();
  });

  it('returns only published media', () => {
    expect(result.media).toHaveLength(1);
    expect(result.media[0].url).toBe('a.jpg');
  });
});
