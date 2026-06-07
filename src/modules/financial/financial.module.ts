import { Global, Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { DreService } from './dre.service';

@Global()
@Module({
  controllers: [FinancialController],
  providers: [FinancialService, DreService],
  exports: [FinancialService, DreService],
})
export class FinancialModule {}
