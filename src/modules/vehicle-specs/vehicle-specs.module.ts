import { Module } from '@nestjs/common';
import { VehicleSpecsController } from './vehicle-specs.controller';
import { VehicleSpecsService } from './vehicle-specs.service';
import { MockVehicleSpecsProvider } from './providers/mock-vehicle-specs.provider';
import { VEHICLE_SPECS_PROVIDER } from './interfaces/vehicle-specs-provider.interface';

/**
 * To plug an external provider:
 *   1. Implement VehicleSpecsProvider in providers/external-...provider.ts
 *   2. Swap the useClass below (or use a factory keyed on VEHICLE_SPECS_PROVIDER
 *      env var) to select the implementation.
 */
@Module({
  controllers: [VehicleSpecsController],
  providers: [
    MockVehicleSpecsProvider,
    {
      provide: VEHICLE_SPECS_PROVIDER,
      useExisting: MockVehicleSpecsProvider,
    },
    VehicleSpecsService,
  ],
  exports: [VehicleSpecsService],
})
export class VehicleSpecsModule {}
