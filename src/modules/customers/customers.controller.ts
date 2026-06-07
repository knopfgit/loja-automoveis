import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CustomersService } from './customers.service';
import {
  AddressDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateMyProfileDto,
} from './dto/customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  // ----- self-service (CUSTOMER) -----
  @Get('me')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Consultar meus dados (CUSTOMER)' })
  getMe(@CurrentUser() user: AuthUser) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.getMe(user.customerId);
  }

  @Patch('me')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Atualizar meus dados (CUSTOMER)' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMyProfileDto) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.updateMe(user.customerId, dto);
  }

  @Post('me/addresses')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Adicionar endereço (CUSTOMER)' })
  addMyAddress(@CurrentUser() user: AuthUser, @Body() dto: AddressDto) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.addAddress(user.customerId, dto);
  }

  // ----- management (ADMIN / SELLER) -----
  @Post()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Cadastrar cliente (ADMIN/SELLER)' })
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar clientes (ADMIN/SELLER)' })
  findAll(@Query() pg: PaginationQueryDto, @Query('search') search?: string) {
    return this.service.findAll(pg, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Detalhar cliente' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Post(':id/addresses')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Adicionar endereço ao cliente' })
  addAddress(@Param('id') id: string, @Body() dto: AddressDto) {
    return this.service.addAddress(id, dto);
  }

  @Patch(':id/addresses/:addressId')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Atualizar endereço do cliente' })
  updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: AddressDto,
  ) {
    return this.service.updateAddress(id, addressId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Remover endereço do cliente' })
  removeAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.service.removeAddress(id, addressId);
  }
}
