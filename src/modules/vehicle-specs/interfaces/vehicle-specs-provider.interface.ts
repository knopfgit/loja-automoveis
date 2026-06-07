/**
 * Decoupled provider contract for the vehicle technical-spec catalog.
 * Implementations: MockVehicleSpecsProvider (offline, default) and any future
 * external integration (FIPE-like API, manufacturer catalog, etc.).
 *
 * The system never *requires* a paid external API — the mock provider returns
 * realistic sample data so every endpoint works out of the box.
 */
export interface SpecBrand {
  id: string;
  name: string;
}

export interface SpecModel {
  id: string;
  brandId: string;
  name: string;
}

export interface SpecVersion {
  id: string;
  modelId: string;
  year: number;
  name: string;
}

export interface TechnicalSpec {
  engine?: string;
  power?: string;
  torque?: string;
  displacement?: string;
  traction?: string;
  steering?: string;
  suspension?: string;
  urbanConsumption?: string;
  roadConsumption?: string;
  tankCapacity?: string;
  trunkCapacity?: string;
  length?: string;
  width?: string;
  height?: string;
  wheelbase?: string;
  weight?: string;
  airbags?: string;
  brakes?: string;
  safetyItems?: string[];
  comfortItems?: string[];
  multimedia?: string[];
  options?: string[];
  fuel?: string;
  transmission?: string;
  doors?: number;
  seats?: number;
}

export interface SpecSearchResult {
  brand: string;
  model: string;
  year: number;
  version?: string;
  spec: TechnicalSpec;
  /** which provider produced the data */
  source: 'PROVIDER_MOCK' | 'PROVIDER_EXTERNAL';
}

export interface VehicleSpecsProvider {
  readonly name: string;
  getBrands(): Promise<SpecBrand[]>;
  getModels(brandId: string): Promise<SpecModel[]>;
  getYears(modelId: string): Promise<number[]>;
  getVersions(modelId: string, year?: number): Promise<SpecVersion[]>;
  search(params: {
    brand: string;
    model: string;
    year: number;
    version?: string;
  }): Promise<SpecSearchResult | null>;
}

export const VEHICLE_SPECS_PROVIDER = 'VEHICLE_SPECS_PROVIDER';
