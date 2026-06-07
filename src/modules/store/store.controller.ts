import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { StoreService } from './store.service';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @Public()
  @Get('location')
  @ApiOperation({ summary: 'Localização pública da loja (mapa/rota)' })
  location() {
    return this.service.getLocation();
  }

  @Get('config')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configuração completa da loja (ADMIN)' })
  config() {
    return this.service.getConfig();
  }

  @Put('config')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configurar dados/integrações da loja (ADMIN)' })
  upsert(@Body() dto: any, @CurrentUser() user: AuthUser) {
    return this.service.upsert(dto, user.userId);
  }
}
