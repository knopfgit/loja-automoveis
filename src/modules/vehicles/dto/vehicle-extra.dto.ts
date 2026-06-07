import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FuelType, Transmission, VehicleStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}

export class ChangeStatusDto {
  @ApiProperty({ enum: VehicleStatus })
  @IsEnum(VehicleStatus)
  status!: VehicleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ArchiveVehicleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApplySpecsDto {
  @ApiProperty({ example: 'Volkswagen' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'T-Cross' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 2023 })
  @Type(() => Number)
  @IsInt()
  year!: number;

  @ApiPropertyOptional({ example: '200 TSI Comfortline' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description:
      'Sobrescritas manuais aplicadas após o preenchimento automático',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  manualOverrides?: Record<string, any>;
}

export class UpsertSpecDto {
  @ApiPropertyOptional() @IsOptional() @IsString() engine?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() power?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() torque?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() displacement?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() traction?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() steering?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() suspension?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() urbanConsumption?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() roadConsumption?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tankCapacity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() trunkCapacity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() length?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() width?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() height?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() wheelbase?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() weight?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() airbags?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brakes?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  safetyItems?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  comfortItems?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  multimedia?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  options?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() technicalNotes?: string;
}

export class MediaItemDto {
  @ApiProperty()
  @IsString()
  url!: string;

  @ApiPropertyOptional({ default: 'image' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;
}

export class VehicleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() model?: string;
  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;
  @ApiPropertyOptional({ enum: FuelType })
  @IsOptional()
  @IsEnum(FuelType)
  fuel?: FuelType;
  @ApiPropertyOptional({ enum: Transmission })
  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() featured?: string;
}
