import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsCPF } from '../../../common/validators/br-validators.decorator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Carlos Vendedor' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '39053344705' })
  @IsCPF()
  cpf!: string;

  @ApiProperty({ example: 'carlos@autodealer.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '54999990000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '54999990000' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'Vendedor' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    enum: [UserRole.ADMIN, UserRole.SELLER],
    default: UserRole.SELLER,
  })
  @IsEnum(UserRole)
  role: UserRole = UserRole.SELLER;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pixKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'ID da regra de comissão padrão' })
  @IsOptional()
  @IsString()
  defaultCommissionRuleId?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
