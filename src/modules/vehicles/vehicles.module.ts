import { Module } from '@nestjs/common';
import { VehicleSpecsModule } from '../vehicle-specs/vehicle-specs.module';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { StockService } from './stock.service';

@Module({
  imports: [VehicleSpecsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, StockService],
  exports: [VehiclesService, StockService],
})
export class VehiclesModule {}
