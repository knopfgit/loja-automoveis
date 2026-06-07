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
  Res,
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
import { Response } from 'express';
import { createReadStream } from 'fs';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { DocumentsService } from './documents.service';
import {
  ChecklistStatusQueryDto,
  CreateDocumentDto,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  UpsertChecklistDto,
  ValidateDocumentDto,
} from './dto/document.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  // ----- types (ADMIN) -----
  @Get('document-types')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar tipos de documento' })
  listTypes(@Query('ownerType') ownerType?: string) {
    return this.service.listTypes(ownerType);
  }

  @Post('document-types')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar tipo de documento configurável' })
  createType(@Body() dto: CreateDocumentTypeDto) {
    return this.service.createType(dto);
  }

  @Patch('document-types/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar/ativar/desativar tipo de documento' })
  updateType(@Param('id') id: string, @Body() dto: UpdateDocumentTypeDto) {
    return this.service.updateType(id, dto);
  }

  // ----- checklists (ADMIN) -----
  @Get('document-checklists')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar checklists configurados por etapa' })
  listChecklists(@Query('stage') stage?: string) {
    return this.service.listChecklists(stage);
  }

  @Put('document-checklists')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configurar item de checklist por etapa' })
  upsertChecklist(@Body() dto: UpsertChecklistDto) {
    return this.service.upsertChecklist(dto);
  }

  @Delete('document-checklists/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover item de checklist' })
  removeChecklist(@Param('id') id: string) {
    return this.service.removeChecklist(id);
  }

  @Get('document-checklists/status')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({
    summary: 'Status do checklist (documentos pendentes) por etapa',
  })
  checklistStatus(@Query() query: ChecklistStatusQueryDto) {
    return this.service.checklistStatus(query);
  }

  // ----- documents -----
  @Post('documents')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Solicitar/registrar documento (sem arquivo)' })
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Post('documents/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Enviar arquivo de documento (cria nova versão)' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDocumentDto & { documentId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.upload(body.documentId, file, body, user.userId);
  }

  @Post('documents/:id/validate')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Aprovar ou rejeitar documento' })
  validate(
    @Param('id') id: string,
    @Body() dto: ValidateDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.validate(id, dto, user.userId);
  }

  @Get('documents')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({
    summary:
      'Listar documentos (filtros: vehicleId, customerId, saleId, status)',
  })
  findMany(
    @Query() pg: PaginationQueryDto,
    @Query('vehicleId') vehicleId?: string,
    @Query('customerId') customerId?: string,
    @Query('saleId') saleId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findMany(pg, { vehicleId, customerId, saleId, status });
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Detalhar documento' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('documents/:id/download')
  @ApiOperation({
    summary: 'Baixar arquivo (restrito; cliente só os próprios)',
  })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { path, mimeType, fileName } = await this.service.resolveForDownload(
      id,
      user,
    );
    // Bypass the global response envelope for binary streaming.
    res.locals.rawResponse = true;
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    createReadStream(path).pipe(res);
  }

  // ----- customer self-service upload -----
  @Post('me/documents/upload')
  @Roles('CUSTOMER')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Cliente envia documento solicitado' })
  uploadMine(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDocumentDto & { documentId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.upload(
      body.documentId,
      file,
      {
        ...body,
        customerId: user.customerId ?? undefined,
        ownerType: 'CUSTOMER',
      },
      user.userId,
    );
  }

  @Get('me/documents')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Cliente consulta seus documentos' })
  myDocuments(@CurrentUser() user: AuthUser, @Query() pg: PaginationQueryDto) {
    return this.service.findMany(pg, {
      customerId: user.customerId ?? undefined,
    });
  }
}
