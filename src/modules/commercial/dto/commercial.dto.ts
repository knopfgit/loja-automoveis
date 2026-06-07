import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AcquisitionType, PaymentMethod, SaleStatus } from '@prisma/client';

// --------------------------------------------------------- Acquisition
export class CreateAcquisitionDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiPropertyOptional({ enum: AcquisitionType })
  @IsOptional()
  @IsEnum(AcquisitionType)
  type?: AcquisitionType;

  @ApiPropertyOptional({ description: 'Quem vendeu o veículo para a loja' })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerDocument?: string;

  @ApiProperty({ example: 90000 })
  @Type(() => Number)
  @IsNumber()
  purchasePrice!: number;

  @ApiProperty({ example: '2025-01-10' })
  @IsString()
  purchaseDate!: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  installments?: number;

  @ApiPropertyOptional({
    example: 1500,
    description: 'Custos adicionais (transporte etc.)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  additionalCosts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Confirmar imediatamente (gera lançamento)',
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

// --------------------------------------------------------- Reservation
export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Vendedor responsável (Employee id)' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Dias de validade (default da configuração)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  durationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  depositAmount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

// --------------------------------------------------------- Sale
export class CreateSaleDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({
    description: 'Vendedor (Employee id). Default: usuário logado',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  announcedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  negotiatedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  downPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  installments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  financing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  financialInstitution?: string;

  @ApiPropertyOptional({
    description: 'Veículo recebido como troca (vehicle id)',
  })
  @IsOptional()
  @IsString()
  tradeInVehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryForecast?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}

export class UpdateSaleStatusDto {
  @ApiProperty({ enum: SaleStatus })
  @IsEnum(SaleStatus)
  status!: SaleStatus;

  @ApiPropertyOptional({
    description: 'Valor final (obrigatório ao COMPLETAR)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  finalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
