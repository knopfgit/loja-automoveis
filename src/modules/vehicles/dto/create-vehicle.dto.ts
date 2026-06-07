import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  FuelType,
  Transmission,
  VehicleCondition,
  VehicleOrigin,
} from '@prisma/client';

export class CreateVehicleDto {
  // ---- Identification ----
  @ApiProperty({ example: 'Volkswagen' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'T-Cross' })
  @IsString()
  model!: string;

  @ApiPropertyOptional({ example: '200 TSI Comfortline' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ example: 2022 })
  @Type(() => Number)
  @IsInt()
  manufactureYear!: number;

  @ApiProperty({ example: 2023 })
  @Type(() => Number)
  @IsInt()
  modelYear!: number;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ example: '00123456789' })
  @IsOptional()
  @IsString()
  renavam?: string;

  @ApiPropertyOptional({ example: '9BWZZZ377VT004251' })
  @IsOptional()
  @IsString()
  chassis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({ example: 'SUV' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Hatch' })
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiPropertyOptional({ example: 'Prata' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: FuelType })
  @IsOptional()
  @IsEnum(FuelType)
  fuel?: FuelType;

  @ApiPropertyOptional({ enum: Transmission })
  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doors?: number;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seats?: number;

  @ApiPropertyOptional({ enum: VehicleCondition })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({ enum: VehicleOrigin })
  @IsOptional()
  @IsEnum(VehicleOrigin)
  origin?: VehicleOrigin;

  // ---- Commercial (internal) ----
  @ApiPropertyOptional({ example: 95000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 115000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  suggestedPrice?: number;

  @ApiPropertyOptional({ example: 112900.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  announcedPrice?: number;

  @ApiPropertyOptional({
    example: 108000.0,
    description: 'Valor mínimo autorizado (interno)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  availableForAd?: boolean;

  @ApiPropertyOptional({ description: 'Observações internas (não públicas)' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Descrição pública do anúncio' })
  @IsOptional()
  @IsString()
  publicDescription?: string;
}
