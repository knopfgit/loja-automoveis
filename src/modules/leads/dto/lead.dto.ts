import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadOrigin, LeadStatus } from '@prisma/client';

export class SpecialistContactDto {
  @ApiPropertyOptional({ description: 'ID do veículo visualizado' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Cliente identificado (se logado)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'João Visitante' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '54999998888' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: LeadOrigin,
    default: LeadOrigin.SPECIALIST_BUTTON,
  })
  @IsOptional()
  @IsEnum(LeadOrigin)
  origin?: LeadOrigin;

  @ApiPropertyOptional({ example: '/veiculos/vw-t-cross-2023' })
  @IsOptional()
  @IsString()
  sourcePage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status!: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddInteractionDto {
  @ApiProperty({ example: 'note' })
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;
}
