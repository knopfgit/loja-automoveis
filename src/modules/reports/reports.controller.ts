import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { toCsv } from '../../common/utils/csv.util';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  private respond(
    res: Response,
    rows: Record<string, any>[],
    format: string | undefined,
    name: string,
  ) {
    if (format === 'csv') {
      res.locals.rawResponse = true;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${name}.csv"`,
      );
      res.send(toCsv(rows));
      return;
    }
    // JSON envelope (handled by the global interceptor).
    res.json({
      success: true,
      data: rows,
      meta: { total: rows.length, timestamp: new Date().toISOString() },
    });
  }

  private async run(
    res: Response,
    format: string | undefined,
    name: string,
    loader: () => Promise<Record<string, any>[]>,
  ) {
    // Mark raw so the interceptor doesn't double-wrap; we send manually.
    res.locals.rawResponse = true;
    const rows = await loader();
    this.respond(res, rows, format, name);
  }

  @Get('vehicles-stock')
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @ApiOperation({ summary: 'Relatório: estoque de veículos' })
  vehiclesStock(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'estoque-veiculos', () =>
      this.service.vehiclesStock(),
    );
  }

  @Get('vehicles-sold')
  @ApiOperation({ summary: 'Relatório: veículos vendidos' })
  vehiclesSold(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'veiculos-vendidos', () =>
      this.service.vehiclesSold(),
    );
  }

  @Get('vehicles-available')
  @ApiOperation({ summary: 'Relatório: veículos disponíveis' })
  vehiclesAvailable(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'veiculos-disponiveis', () =>
      this.service.vehiclesAvailable(),
    );
  }

  @Get('vehicles-stale')
  @ApiOperation({ summary: 'Relatório: veículos parados há muitos dias' })
  vehiclesStale(
    @Res() res: Response,
    @Query('days') days?: string,
    @Query('format') format?: string,
  ) {
    return this.run(res, format, 'veiculos-parados', () =>
      this.service.vehiclesStale(days ? Number(days) : 60),
    );
  }

  @Get('dre-consolidated')
  @ApiOperation({ summary: 'Relatório: DRE consolidada' })
  dreConsolidated(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    return this.run(res, format, 'dre-consolidada', () =>
      this.service.dreConsolidated(
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
      ),
    );
  }

  @Get('dre-vehicle/:vehicleId')
  @ApiOperation({ summary: 'Relatório: DRE por veículo' })
  dreByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Res() res: Response,
    @Query('format') format?: string,
  ) {
    return this.run(res, format, `dre-${vehicleId}`, () =>
      this.service.dreByVehicle(vehicleId),
    );
  }

  @Get('sales-by-period')
  @ApiOperation({ summary: 'Relatório: vendas por período' })
  salesByPeriod(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    return this.run(res, format, 'vendas-periodo', () =>
      this.service.salesByPeriod(
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
      ),
    );
  }

  @Get('sales-by-seller')
  @ApiOperation({ summary: 'Relatório: vendas por vendedor' })
  salesBySeller(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'vendas-vendedor', () =>
      this.service.salesBySeller(),
    );
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Relatório: comissões' })
  commissions(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'comissoes', () => this.service.commissions());
  }

  @Get('documents-pending')
  @ApiOperation({ summary: 'Relatório: documentos pendentes' })
  documentsPending(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'documentos-pendentes', () =>
      this.service.documentsPending(),
    );
  }

  @Get('documents-expiring')
  @ApiOperation({ summary: 'Relatório: documentos próximos do vencimento' })
  documentsExpiring(
    @Res() res: Response,
    @Query('days') days?: string,
    @Query('format') format?: string,
  ) {
    return this.run(res, format, 'documentos-vencendo', () =>
      this.service.documentsExpiring(days ? Number(days) : 30),
    );
  }

  @Get('maintenances')
  @ApiOperation({ summary: 'Relatório: manutenções' })
  maintenances(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'manutencoes', () =>
      this.service.maintenances(),
    );
  }

  @Get('future-revisions')
  @ApiOperation({ summary: 'Relatório: revisões futuras' })
  futureRevisions(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'revisoes-futuras', () =>
      this.service.futureRevisions(),
    );
  }

  @Get('parts-stock')
  @ApiOperation({ summary: 'Relatório: estoque de peças' })
  partsStock(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'estoque-pecas', () =>
      this.service.partsStock(),
    );
  }

  @Get('parts-low-stock')
  @ApiOperation({ summary: 'Relatório: peças abaixo do mínimo' })
  partsLowStock(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'pecas-estoque-minimo', () =>
      this.service.partsLowStock(),
    );
  }

  @Get('leads')
  @ApiOperation({ summary: 'Relatório: leads' })
  leads(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'leads', () => this.service.leads());
  }

  @Get('conversions')
  @ApiOperation({ summary: 'Relatório: conversões' })
  conversions(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'conversoes', () =>
      this.service.conversions(),
    );
  }

  @Get('marketing-interested')
  @ApiOperation({ summary: 'Relatório: clientes interessados em promoções' })
  marketingInterested(@Res() res: Response, @Query('format') format?: string) {
    return this.run(res, format, 'clientes-promocoes', () =>
      this.service.marketingInterested(),
    );
  }
}
