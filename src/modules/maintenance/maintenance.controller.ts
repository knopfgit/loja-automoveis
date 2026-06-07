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
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { MaintenanceService } from './maintenance.service';
import {
  AddMaintenancePartDto,
  CompleteMaintenanceDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto/maintenance.dto';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenances')
@Roles('ADMIN', 'SELLER')
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Abrir manutenção/revisão' })
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar manutenções' })
  findAll(
    @Query() pg: PaginationQueryDto,
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(pg, vehicleId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar manutenção' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar manutenção' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Post(':id/parts')
  @ApiOperation({
    summary: 'Aplicar peça à manutenção (baixa de estoque + DRE)',
  })
  addPart(
    @Param('id') id: string,
    @Body() dto: AddMaintenancePartDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addPart(id, dto, user.userId);
  }

  @Delete(':id/parts/:maintenancePartId')
  @ApiOperation({ summary: 'Estornar peça aplicada' })
  removePart(
    @Param('id') id: string,
    @Param('maintenancePartId') maintenancePartId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.removePart(id, maintenancePartId, user.userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Finalizar manutenção (gera lançamentos e prazos)' })
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteMaintenanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.complete(id, dto, user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar manutenção (estorna peças)' })
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.cancel(id, user.userId);
  }
}
