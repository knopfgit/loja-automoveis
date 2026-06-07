import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PersonType } from '@prisma/client';
import {
  IsCpfOrCnpj,
  IsCEP,
} from '../../../common/validators/br-validators.decorator';

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: '95010000' })
  @IsOptional()
  @IsCEP()
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Caxias do Sul' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'RS' })
  @IsOptional()
  @IsString()
  state?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'Maria Cliente' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '52998224725', description: 'CPF ou CNPJ' })
  @IsCpfOrCnpj()
  document!: string;

  @ApiPropertyOptional({ enum: PersonType })
  @IsOptional()
  @IsEnum(PersonType)
  personType?: PersonType;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: '1990-05-20' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  cookieConsent?: boolean;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  address?: AddressDto;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class UpdateMyProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
