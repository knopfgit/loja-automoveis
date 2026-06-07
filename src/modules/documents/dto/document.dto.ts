import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ChecklistStage,
  DocumentOwnerType,
  DocumentStatus,
} from '@prisma/client';

export class CreateDocumentTypeDto {
  @ApiProperty({ example: 'CRLV' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'CRLV-e' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: DocumentOwnerType })
  @IsEnum(DocumentOwnerType)
  ownerType!: DocumentOwnerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasExpiry?: boolean;
}

export class UpdateDocumentTypeDto extends PartialType(CreateDocumentTypeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpsertChecklistDto {
  @ApiProperty({ enum: ChecklistStage })
  @IsEnum(ChecklistStage)
  stage!: ChecklistStage;

  @ApiProperty()
  @IsString()
  documentTypeId!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;
}

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  documentTypeId!: string;

  @ApiProperty({ enum: DocumentOwnerType })
  @IsEnum(DocumentOwnerType)
  ownerType!: DocumentOwnerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  saleId?: string;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ValidateDocumentDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ChecklistStatusQueryDto {
  @ApiProperty({ enum: ChecklistStage })
  @IsEnum(ChecklistStage)
  stage!: ChecklistStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  saleId?: string;
}
