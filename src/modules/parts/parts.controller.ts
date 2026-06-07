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
import { PartsService } from './parts.service';
import { SuppliersService } from './suppliers.service';
import {
  CreatePartDto,
  CreateSupplierDto,
  PartMovementDto,
  UpdatePartDto,
  UpdateSupplierDto,
} from './dto/part.dto';

@ApiTags('Parts & Suppliers')
@ApiBearerAuth()
@Controller()
export class PartsController {
  constructor(
    private readonly parts: PartsService,
    private readonly suppliers: SuppliersService,
  ) {}

  // ----- parts -----
  @Post('parts')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastrar peça' })
  create(@Body() dto: CreatePartDto, @CurrentUser() user: AuthUser) {
    return this.parts.create(dto, user.userId);
  }

  @Get('parts')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar peças (filtro lowStock=true disponível)' })
  findAll(
    @Query() pg: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.parts.findAll(pg, search, lowStock === 'true');
  }

  @Get('parts/:id')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Detalhar peça' })
  findOne(@Param('id') id: string) {
    return this.parts.findOne(id);
  }

  @Patch('parts/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar peça' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePartDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.parts.update(id, dto, user.userId);
  }

  @Post('parts/:id/movements')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Movimentar estoque (ENTRY, EXIT, ADJUSTMENT, RESERVE, LOSS, RETURN...)',
  })
  move(
    @Param('id') id: string,
    @Body() dto: PartMovementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.parts.move(id, dto, user.userId);
  }

  @Get('parts/:id/movements')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Histórico de movimentações da peça' })
  movements(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.parts.listMovements(id, Number(page), Number(limit));
  }

  // ----- suppliers -----
  @Post('suppliers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastrar fornecedor' })
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliers.create(dto);
  }

  @Get('suppliers')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar fornecedores' })
  listSuppliers(@Query() pg: PaginationQueryDto) {
    return this.suppliers.findAll(pg);
  }

  @Patch('suppliers/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliers.update(id, dto);
  }

  @Delete('suppliers/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar fornecedor' })
  removeSupplier(@Param('id') id: string) {
    return this.suppliers.remove(id);
  }
}
