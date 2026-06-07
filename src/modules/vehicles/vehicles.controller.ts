import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { StorageService } from '../../storage/storage.service';
import { VehiclesService } from './vehicles.service';
import { StockService } from './stock.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import {
  ApplySpecsDto,
  ArchiveVehicleDto,
  ChangeStatusDto,
  MediaItemDto,
  UpdateVehicleDto,
  UpsertSpecDto,
  VehicleQueryDto,
} from './dto/vehicle-extra.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@Roles('ADMIN', 'SELLER')
export class VehiclesController {
  constructor(
    private readonly vehicles: VehiclesService,
    private readonly stock: StockService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar veículo' })
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: AuthUser) {
    return this.vehicles.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos (visão interna)' })
  findAll(@Query() query: VehicleQueryDto) {
    return this.vehicles.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar veículo (visão interna)' })
  findOne(@Param('id') id: string) {
    return this.vehicles.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehicles.update(id, dto, user.userId);
  }

  @Post(':id/archive')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Arquivar veículo (ADMIN)' })
  archive(
    @Param('id') id: string,
    @Body() dto: ArchiveVehicleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehicles.archive(id, dto.reason, user.userId);
  }

  // ----- stock -----
  @Post(':id/status')
  @ApiOperation({ summary: 'Alterar status / movimentar estoque' })
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stock.changeStatus(
      id,
      dto.status,
      { reason: dto.reason, notes: dto.notes },
      user.userId,
    );
  }

  @Get(':id/stock-movements')
  @ApiOperation({ summary: 'Histórico de movimentações de estoque' })
  movements(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.stock.listMovements(id, Number(page), Number(limit));
  }

  // ----- specs -----
  @Post(':id/apply-specs')
  @ApiOperation({
    summary: 'Preencher ficha técnica automaticamente (com fallback manual)',
  })
  applySpecs(
    @Param('id') id: string,
    @Body() dto: ApplySpecsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehicles.applySpecs(id, dto, user.userId);
  }

  @Put(':id/spec')
  @ApiOperation({ summary: 'Editar ficha técnica manualmente' })
  upsertSpec(
    @Param('id') id: string,
    @Body() dto: UpsertSpecDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehicles.upsertSpec(id, dto, user.userId);
  }

  // ----- media -----
  @Post(':id/media')
  @ApiOperation({ summary: 'Adicionar mídia por URL' })
  addMedia(
    @Param('id') id: string,
    @Body() dto: MediaItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehicles.addMedia(id, dto, user.userId);
  }

  @Post(':id/media/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de imagem do veículo' })
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new AppException('VALIDATION_ERROR', 'Arquivo ausente.');
    const stored = await this.storage.save(file, 'vehicles');
    return this.vehicles.addMedia(
      id,
      { url: stored.url, type: 'image', altText: file.originalname },
      user.userId,
    );
  }

  @Patch(':id/media/reorder')
  @ApiOperation({ summary: 'Reordenar mídias' })
  reorder(
    @Param('id') id: string,
    @Body() body: { order: { mediaId: string; position: number }[] },
  ) {
    return this.vehicles.reorderMedia(id, body.order);
  }

  @Delete(':id/media/:mediaId')
  @ApiOperation({ summary: 'Remover mídia' })
  removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.vehicles.removeMedia(id, mediaId);
  }
}
