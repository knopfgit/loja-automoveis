import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  ClientInfo,
  ClientInfoParam,
} from '../../common/decorators/client-info.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { VehiclesService } from '../vehicles/vehicles.service';
import { StoreService } from '../store/store.service';
import { LeadsService } from '../leads/leads.service';
import { PrivacyService } from '../privacy/privacy.service';
import { VehicleQueryDto } from '../vehicles/dto/vehicle-extra.dto';
import { SpecialistContactDto } from '../leads/dto/lead.dto';
import {
  MarketingPreferenceDto,
  RegisterConsentDto,
  VehicleViewDto,
} from '../privacy/dto/privacy.dto';

/**
 * Public, unauthenticated endpoints for the institutional website / catalog.
 * Only public-safe vehicle fields are ever returned (see vehicles.serializer).
 */
@ApiTags('Public')
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly vehicles: VehiclesService,
    private readonly store: StoreService,
    private readonly leads: LeadsService,
    private readonly privacy: PrivacyService,
  ) {}

  @Get('vehicles/featured')
  @ApiOperation({ summary: 'Veículos em destaque' })
  featured() {
    return this.vehicles.findFeatured();
  }

  @Get('vehicles/most-viewed')
  @ApiOperation({ summary: 'Veículos mais visualizados' })
  mostViewed() {
    return this.vehicles.findMostViewed();
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Catálogo público de veículos (com filtros)' })
  list(@Query() query: VehicleQueryDto) {
    return this.vehicles.findPublic(query);
  }

  @Get('vehicles/:slug')
  @ApiOperation({ summary: 'Detalhe público de um veículo por slug' })
  bySlug(@Param('slug') slug: string) {
    return this.vehicles.findPublicBySlug(slug);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Opções de filtro disponíveis no catálogo' })
  filters() {
    return this.vehicles.publicFilters();
  }

  @Get('store/location')
  @ApiOperation({ summary: 'Localização pública da loja' })
  storeLocation() {
    return this.store.getLocation();
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('leads/specialist-contact')
  @ApiOperation({
    summary: 'Falar com especialista (gera lead + URL do WhatsApp)',
  })
  specialistContact(@Body() dto: SpecialistContactDto) {
    return this.leads.specialistContact(dto);
  }

  @Post('tracking/vehicle-view')
  @ApiOperation({ summary: 'Registrar visualização de veículo' })
  trackView(
    @Body() dto: VehicleViewDto,
    @ClientInfoParam() client: ClientInfo,
  ) {
    return this.privacy.trackVehicleView(dto, client);
  }

  @Post('consents')
  @ApiOperation({ summary: 'Registrar consentimento de cookies (visitante)' })
  consents(
    @Body() dto: RegisterConsentDto,
    @ClientInfoParam() client: ClientInfo,
  ) {
    return this.privacy.registerConsent(dto, client);
  }

  @Put('marketing/preferences')
  @ApiOperation({
    summary:
      'Atualizar preferências de marketing (requer customerId no corpo para visitante identificado)',
  })
  marketing(@Body() dto: MarketingPreferenceDto & { customerId?: string }) {
    if (!dto.customerId) {
      throw new AppException(
        'VALIDATION_ERROR',
        'customerId é obrigatório neste endpoint público.',
      );
    }
    return this.privacy.setMarketingPreferences(dto.customerId, dto);
  }
}
