import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { VehicleSpecsService } from './vehicle-specs.service';

@ApiTags('Vehicle Specs (catálogo / ficha técnica)')
@Controller('vehicle-specs')
export class VehicleSpecsController {
  constructor(private readonly service: VehicleSpecsService) {}

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'Listar marcas disponíveis no catálogo' })
  brands() {
    return this.service.getBrands();
  }

  @Public()
  @Get('models')
  @ApiQuery({ name: 'brandId', required: true })
  @ApiOperation({ summary: 'Listar modelos por marca' })
  models(@Query('brandId') brandId: string) {
    return this.service.getModels(brandId);
  }

  @Public()
  @Get('years')
  @ApiQuery({ name: 'modelId', required: true })
  @ApiOperation({ summary: 'Listar anos por modelo' })
  years(@Query('modelId') modelId: string) {
    return this.service.getYears(modelId);
  }

  @Public()
  @Get('versions')
  @ApiQuery({ name: 'modelId', required: true })
  @ApiQuery({ name: 'year', required: false })
  @ApiOperation({ summary: 'Listar versões por modelo e ano' })
  versions(@Query('modelId') modelId: string, @Query('year') year?: string) {
    return this.service.getVersions(modelId, year ? Number(year) : undefined);
  }

  @Public()
  @Get('search')
  @ApiQuery({ name: 'brand', required: true })
  @ApiQuery({ name: 'model', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'version', required: false })
  @ApiOperation({
    summary: 'Consultar ficha técnica por marca/modelo/ano/versão',
  })
  search(
    @Query('brand') brand: string,
    @Query('model') model: string,
    @Query('year') year: string,
    @Query('version') version?: string,
  ) {
    return this.service.search({
      brand,
      model,
      year: Number(year),
      version,
    });
  }
}
