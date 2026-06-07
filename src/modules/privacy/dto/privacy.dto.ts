import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConsentCategory } from '@prisma/client';

export class ConsentItemDto {
  @ApiProperty({ enum: ConsentCategory })
  @IsEnum(ConsentCategory)
  category!: ConsentCategory;

  @ApiProperty()
  @IsBoolean()
  granted!: boolean;
}

export class RegisterConsentDto {
  @ApiProperty({ type: [ConsentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsentItemDto)
  consents!: ConsentItemDto[];

  @ApiPropertyOptional({ example: '1.0' })
  @IsOptional()
  @IsString()
  termsVersion?: string;

  @ApiPropertyOptional({ description: 'Sessão anônima (visitante)' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class VehicleViewDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourcePage?: string;
}

export class LocationTrackingDto {
  @ApiProperty({ example: -29.1685 })
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: -51.1796 })
  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class MarketingPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOptIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappOptIn?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  interestBrands?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  interestModels?: string[];

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

  @ApiPropertyOptional({
    description:
      'Apenas para o endpoint público /public/marketing/preferences ' +
      '(visitante identificado). Ignorado nas rotas autenticadas.',
  })
  @IsOptional()
  @IsString()
  customerId?: string;
}
