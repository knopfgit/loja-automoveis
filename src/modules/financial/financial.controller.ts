import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinancialNature } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { FinancialService } from './financial.service';
import { DreService } from './dre.service';

class CreateFinancialEntryDto {
  @IsOptional() @IsString() vehicleId?: string;
  @IsEnum(FinancialNature) nature!: FinancialNature;
  @IsString() category!: string;
  @Type(() => Number) @IsNumber() amount!: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() documentId?: string;
}

@ApiTags('Financial & DRE')
@ApiBearerAuth()
@Controller()
@Roles('ADMIN')
export class FinancialController {
  constructor(
    private readonly financial: FinancialService,
    private readonly dre: DreService,
  ) {}

  // ----- financial entries -----
  @Post('financial-entries')
  @ApiOperation({ summary: 'Lançar receita/despesa manual' })
  create(@Body() dto: CreateFinancialEntryDto, @CurrentUser() user: AuthUser) {
    return this.financial.createManual(dto, user.userId);
  }

  @Get('financial-entries')
  @ApiOperation({ summary: 'Listar lançamentos de um veículo' })
  list(
    @Query('vehicleId') vehicleId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.financial.listByVehicle(vehicleId, Number(page), Number(limit));
  }

  @Delete('financial-entries/:id')
  @ApiOperation({ summary: 'Remover lançamento financeiro' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.financial.remove(id, user.userId);
  }

  // ----- DRE -----
  @Get('dre/consolidated')
  @ApiOperation({ summary: 'DRE consolidada da loja (com filtros de período)' })
  consolidated(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dre.consolidated({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('dre/vehicle/:vehicleId')
  @ApiOperation({ summary: 'DRE de um veículo' })
  byVehicle(@Param('vehicleId') vehicleId: string) {
    return this.dre.getByVehicle(vehicleId);
  }

  @Get('dre/vehicle/:vehicleId/detailed')
  @ApiOperation({ summary: 'DRE detalhada (com lançamentos) de um veículo' })
  detailed(@Param('vehicleId') vehicleId: string) {
    return this.dre.getDetailed(vehicleId);
  }

  @Post('dre/vehicle/:vehicleId/recalculate')
  @ApiOperation({ summary: 'Recalcular DRE do veículo' })
  recalc(@Param('vehicleId') vehicleId: string) {
    return this.dre.recalculate(vehicleId);
  }
}
