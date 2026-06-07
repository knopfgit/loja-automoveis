import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { CommissionsModule } from '../commissions/commissions.module';
import {
  AcquisitionsController,
  ReservationsController,
  SalesController,
} from './commercial.controller';
import { AcquisitionsService } from './acquisitions.service';
import { ReservationsService } from './reservations.service';
import { SalesService } from './sales.service';

@Module({
  imports: [VehiclesModule, CommissionsModule],
  controllers: [
    AcquisitionsController,
    ReservationsController,
    SalesController,
  ],
  providers: [AcquisitionsService, ReservationsService, SalesService],
  exports: [AcquisitionsService, ReservationsService, SalesService],
})
export class CommercialModule {}
