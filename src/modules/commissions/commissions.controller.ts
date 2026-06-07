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
import { AppException } from '../../common/exceptions/app.exception';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CommissionsService } from './commissions.service';
import {
  AdjustCommissionDto,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
} from './dto/commission.dto';

@ApiTags('Commissions')
@ApiBearerAuth()
@Controller()
export class CommissionsController {
  constructor(private readonly service: CommissionsService) {}

  // ----- rules (ADMIN) -----
  @Post('commission-rules')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar regra de comissão' })
  createRule(@Body() dto: CreateCommissionRuleDto) {
    return this.service.createRule(dto);
  }

  @Get('commission-rules')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar regras de comissão' })
  listRules() {
    return this.service.listRules();
  }

  @Patch('commission-rules/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar regra de comissão' })
  updateRule(@Param('id') id: string, @Body() dto: UpdateCommissionRuleDto) {
    return this.service.updateRule(id, dto);
  }

  // ----- seller's own commissions -----
  @Get('commissions/me')
  @Roles('SELLER')
  @ApiOperation({ summary: 'Minhas comissões (SELLER)' })
  mine(
    @CurrentUser() user: AuthUser,
    @Query() pg: PaginationQueryDto,
    @Query('status') status?: string,
  ) {
    if (!user.employeeId) throw new AppException('EMPLOYEE_NOT_FOUND');
    return this.service.findMine(user.employeeId, pg, status);
  }

  // ----- admin management -----
  @Get('commissions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar comissões (ADMIN)' })
  findAll(
    @Query() pg: PaginationQueryDto,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(pg, { sellerId, status });
  }

  @Patch('commissions/:id/approve')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Aprovar comissão' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.approve(id, user.userId);
  }

  @Patch('commissions/:id/pay')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Marcar comissão como paga' })
  pay(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.pay(id, user.userId);
  }

  @Patch('commissions/:id/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancelar comissão' })
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.cancel(id, user.userId);
  }

  @Patch('commissions/:id/adjust')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ajuste manual de comissão (com justificativa)' })
  adjust(
    @Param('id') id: string,
    @Body() dto: AdjustCommissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.adjust(id, dto, user.userId);
  }
}
