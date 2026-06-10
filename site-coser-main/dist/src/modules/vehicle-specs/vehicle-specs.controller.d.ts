import { VehicleSpecsService } from './vehicle-specs.service';
export declare class VehicleSpecsController {
    private readonly service;
    constructor(service: VehicleSpecsService);
    brands(): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecBrand[]>;
    models(brandId: string): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecModel[]>;
    years(modelId: string): Promise<number[]>;
    versions(modelId: string, year?: string): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecVersion[]>;
    search(brand: string, model: string, year: string, version?: string): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecSearchResult | null>;
}
