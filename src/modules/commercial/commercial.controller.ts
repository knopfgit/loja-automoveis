import {
  Body,
  Controller,
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
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AcquisitionsService } from './acquisitions.service';
import { ReservationsService } from './reservations.service';
import { SalesService } from './sales.service';
import {
  CancelReservationDto,
  CreateAcquisitionDto,
  CreateReservationDto,
  CreateSaleDto,
  UpdateSaleDto,
  UpdateSaleStatusDto,
} from './dto/commercial.dto';

// --------------------------------------------------------- Acquisitions
@ApiTags('Commercial - Acquisitions')
@ApiBearerAuth()
@Controller('acquisitions')
@Roles('ADMIN')
export class AcquisitionsController {
  constructor(private readonly service: AcquisitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar compra de veículo (aquisição)' })
  create(@Body() dto: CreateAcquisitionDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar aquisições' })
  findAll(@Query() pg: PaginationQueryDto) {
    return this.service.findAll(pg);
  }

  @Get(':vehicleId')
  @ApiOperation({ summary: 'Aquisição de um veículo' })
  findOne(@Param('vehicleId') vehicleId: string) {
    return this.service.findOne(vehicleId);
  }
}

// --------------------------------------------------------- Reservations
@ApiTags('Commercial - Reservations')
@ApiBearerAuth()
@Controller('reservations')
@Roles('ADMIN', 'SELLER')
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar reserva' })
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() pg: PaginationQueryDto,
    @Query('status') status?: string,
  ) {
    const sellerId =
      user.role === 'SELLER' ? (user.employeeId ?? undefined) : undefined;
    return this.service.findAll(pg, { status, sellerId });
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reserva' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.cancel(id, dto.reason, user.userId);
  }
}

// --------------------------------------------------------- Sales
@ApiTags('Commercial - Sales')
@ApiBearerAuth()
@Controller('sales')
@Roles('ADMIN', 'SELLER')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Iniciar venda/negociação' })
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.employeeId ?? undefined, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas (vendedor vê apenas as próprias)' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() pg: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('sellerId') sellerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const effectiveSeller =
      user.role === 'SELLER' ? (user.employeeId ?? undefined) : sellerId;
    return this.service.findAll(pg, {
      sellerId: effectiveSeller,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar venda' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da venda/negociação' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar etapa da venda (inclui COMPLETED)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSaleStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateStatus(id, dto, user.userId);
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Registrar entrega do veículo' })
  deliver(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.markDelivered(id, user.userId);
  }
}
