import { Module } from '@nestjs/common';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { SuppliersService } from './suppliers.service';

@Module({
  controllers: [PartsController],
  providers: [PartsService, SuppliersService],
  exports: [PartsService, SuppliersService],
})
export class PartsModule {}
