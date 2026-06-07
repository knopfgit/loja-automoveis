import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { StoreModule } from '../store/store.module';
import { LeadsModule } from '../leads/leads.module';
import { PrivacyModule } from '../privacy/privacy.module';
import { PublicController } from './public.controller';

@Module({
  imports: [VehiclesModule, StoreModule, LeadsModule, PrivacyModule],
  controllers: [PublicController],
})
export class PublicModule {}
