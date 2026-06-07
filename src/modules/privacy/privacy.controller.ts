import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  ClientInfo,
  ClientInfoParam,
} from '../../common/decorators/client-info.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PrivacyService } from './privacy.service';
import {
  LocationTrackingDto,
  MarketingPreferenceDto,
  RegisterConsentDto,
  VehicleViewDto,
} from './dto/privacy.dto';

@ApiTags('Privacy / Tracking / Favorites (LGPD)')
@Controller()
export class PrivacyController {
  constructor(private readonly service: PrivacyService) {}

  // ----- consents -----
  @Public()
  @Post('consents')
  @ApiOperation({ summary: 'Registrar consentimento de cookies (público)' })
  registerConsent(
    @Body() dto: RegisterConsentDto,
    @ClientInfoParam() client: ClientInfo,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.service.registerConsent(
      dto,
      client,
      user?.customerId ?? undefined,
    );
  }

  @Get('consents/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meus consentimentos atuais' })
  myConsents(
    @CurrentUser() user: AuthUser,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.service.getMyConsents(user.customerId ?? undefined, sessionId);
  }

  @Put('consents/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar meus consentimentos' })
  updateConsents(
    @Body() dto: RegisterConsentDto,
    @ClientInfoParam() client: ClientInfo,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.registerConsent(
      dto,
      client,
      user.customerId ?? undefined,
    );
  }

  // ----- tracking -----
  @Public()
  @Post('tracking/vehicle-view')
  @ApiOperation({ summary: 'Registrar visualização de veículo (público)' })
  vehicleView(
    @Body() dto: VehicleViewDto,
    @ClientInfoParam() client: ClientInfo,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.service.trackVehicleView(
      dto,
      client,
      user?.customerId ?? undefined,
    );
  }

  @Post('tracking/location')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar localização aproximada (requer consentimento)',
  })
  location(
    @Body() dto: LocationTrackingDto,
    @ClientInfoParam() client: ClientInfo,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.trackLocation(
      dto,
      client,
      user.customerId ?? undefined,
    );
  }

  // ----- favorites (CUSTOMER) -----
  @Post('favorites/:vehicleId')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Favoritar veículo' })
  addFavorite(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.addFavorite(user.customerId, vehicleId);
  }

  @Delete('favorites/:vehicleId')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Remover favorito' })
  removeFavorite(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.removeFavorite(user.customerId, vehicleId);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Listar meus favoritos' })
  listFavorites(@CurrentUser() user: AuthUser) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.listFavorites(user.customerId);
  }

  @Get('me/view-history')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Histórico de veículos visualizados' })
  viewHistory(@CurrentUser() user: AuthUser, @Query() pg: PaginationQueryDto) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.myViewHistory(user.customerId, pg.page, pg.limit);
  }

  // ----- marketing -----
  @Put('marketing/preferences')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({
    summary: 'Atualizar preferências de marketing (opt-in/opt-out)',
  })
  marketing(
    @Body() dto: MarketingPreferenceDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.setMarketingPreferences(user.customerId, dto);
  }

  // ----- privacy requests -----
  @Post('privacy/export-request')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Solicitar exportação dos meus dados (LGPD)' })
  exportRequest(@CurrentUser() user: AuthUser) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.requestExport(user.customerId);
  }

  @Post('privacy/delete-request')
  @ApiBearerAuth()
  @Roles('CUSTOMER')
  @ApiOperation({
    summary: 'Solicitar exclusão/anonimização dos meus dados (LGPD)',
  })
  deleteRequest(@CurrentUser() user: AuthUser) {
    if (!user.customerId) throw new AppException('CUSTOMER_NOT_FOUND');
    return this.service.requestDeletion(user.customerId);
  }
}
