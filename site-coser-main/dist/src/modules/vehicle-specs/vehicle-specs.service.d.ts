import { RedisService } from '../../redis/redis.service';
import { SpecSearchResult, VehicleSpecsProvider } from './interfaces/vehicle-specs-provider.interface';
export declare class VehicleSpecsService {
    private readonly provider;
    private readonly redis;
    private readonly logger;
    private readonly prefix;
    constructor(provider: VehicleSpecsProvider, redis: RedisService);
    private safe;
    getBrands(): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecBrand[]>;
    getModels(brandId: string): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecModel[]>;
    getYears(modelId: string): Promise<number[]>;
    getVersions(modelId: string, year?: number): Promise<import("./interfaces/vehicle-specs-provider.interface").SpecVersion[]>;
    search(params: {
        brand: string;
        model: string;
        year: number;
        version?: string;
    }): Promise<SpecSearchResult | null>;
}
