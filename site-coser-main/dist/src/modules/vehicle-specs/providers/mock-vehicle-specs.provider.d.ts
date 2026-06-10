import { SpecBrand, SpecModel, SpecSearchResult, SpecVersion, VehicleSpecsProvider } from '../interfaces/vehicle-specs-provider.interface';
export declare class MockVehicleSpecsProvider implements VehicleSpecsProvider {
    readonly name = "mock";
    private brandId;
    private modelId;
    getBrands(): Promise<SpecBrand[]>;
    getModels(brandId: string): Promise<SpecModel[]>;
    private findModel;
    getYears(modelId: string): Promise<number[]>;
    getVersions(modelId: string, year?: number): Promise<SpecVersion[]>;
    search(params: {
        brand: string;
        model: string;
        year: number;
        version?: string;
    }): Promise<SpecSearchResult | null>;
}
