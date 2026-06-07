import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { LeadsService } from './leads.service';
import {
  AddInteractionDto,
  SpecialistContactDto,
  UpdateLeadStatusDto,
} from './dto/lead.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('specialist-contact')
  @ApiOperation({
    summary:
      'Botão "Falar com especialista": registra lead, atribui vendedor e retorna URL do WhatsApp',
  })
  specialistContact(@Body() dto: SpecialistContactDto) {
    return this.service.specialistContact(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar leads (vendedor vê apenas os próprios)' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() pg: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('sellerId') sellerId?: string,
  ) {
    const effectiveSeller =
      user.role === 'SELLER' ? (user.employeeId ?? undefined) : sellerId;
    return this.service.findAll(pg, { status, sellerId: effectiveSeller });
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Detalhar lead' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Atualizar status do lead' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateStatus(id, dto, user.userId);
  }

  @Post(':id/interactions')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Registrar interação/observação no lead' })
  addInteraction(
    @Param('id') id: string,
    @Body() dto: AddInteractionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addInteraction(id, dto, user.userId);
  }
}
