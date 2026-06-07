import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommissionRuleType } from '@prisma/client';

export class CreateCommissionRuleDto {
  @ApiProperty({ example: 'Comissão padrão 3%' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: CommissionRuleType })
  @IsEnum(CommissionRuleType)
  type!: CommissionRuleType;

  @ApiPropertyOptional({
    example: 3.5,
    description: 'Percentual (ex.: 3.5 = 3,5%)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  percentage?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fixedAmount?: number;

  @ApiPropertyOptional({
    description: 'Faixas progressivas [{ min, max, percentage }]',
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  tiers?: { min: number; max: number | null; percentage: number }[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCommissionRuleDto extends PartialType(
  CreateCommissionRuleDto,
) {}

export class AdjustCommissionDto {
  @ApiProperty({ example: 1200.0 })
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Justificativa obrigatória do ajuste manual' })
  @IsString()
  reason!: string;
}
