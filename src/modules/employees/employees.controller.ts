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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@Roles('ADMIN')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar funcionário (ADMIN)' })
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários' })
  findAll(@Query() pg: PaginationQueryDto, @Query('active') active?: string) {
    const activeBool = active === undefined ? undefined : active === 'true';
    return this.service.findAll(pg, activeBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar funcionário' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar funcionário' })
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.deactivate(id, user.userId);
  }
}
