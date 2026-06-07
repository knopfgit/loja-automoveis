import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import {
  SpecSearchResult,
  VEHICLE_SPECS_PROVIDER,
  VehicleSpecsProvider,
} from './interfaces/vehicle-specs-provider.interface';

/**
 * Application service around the VehicleSpecsProvider. Adds Redis caching and
 * graceful fallback: if the (future) external provider fails, callers still get
 * a safe empty/null result so manual fill-in remains possible.
 */
@Injectable()
export class VehicleSpecsService {
  private readonly logger = new Logger(VehicleSpecsService.name);
  private readonly prefix = 'specs';

  constructor(
    @Inject(VEHICLE_SPECS_PROVIDER)
    private readonly provider: VehicleSpecsProvider,
    private readonly redis: RedisService,
  ) {}

  private async safe<T>(
    key: string,
    fn: () => Promise<T>,
    fallback: T,
  ): Promise<T> {
    try {
      return await this.redis.remember(`${this.prefix}:${key}`, fn);
    } catch (err) {
      this.logger.warn(
        `Spec provider "${this.provider.name}" failed for ${key}: ${
          err instanceof Error ? err.message : err
        }. Falling back.`,
      );
      return fallback;
    }
  }

  getBrands() {
    return this.safe('brands', () => this.provider.getBrands(), []);
  }

  getModels(brandId: string) {
    return this.safe(
      `models:${brandId}`,
      () => this.provider.getModels(brandId),
      [],
    );
  }

  getYears(modelId: string) {
    return this.safe(
      `years:${modelId}`,
      () => this.provider.getYears(modelId),
      [],
    );
  }

  getVersions(modelId: string, year?: number) {
    return this.safe(
      `versions:${modelId}:${year ?? 'all'}`,
      () => this.provider.getVersions(modelId, year),
      [],
    );
  }

  search(params: {
    brand: string;
    model: string;
    year: number;
    version?: string;
  }): Promise<SpecSearchResult | null> {
    const key = `search:${params.brand}:${params.model}:${params.year}:${
      params.version ?? ''
    }`;
    return this.safe(key, () => this.provider.search(params), null);
  }
}
