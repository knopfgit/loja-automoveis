import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/part.dto';
import { onlyDigits } from '../../common/validators/br-document.util';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        ...dto,
        document: dto.document ? onlyDigits(dto.document) : undefined,
      },
    });
  }

  async findAll(pg: PaginationQueryDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        orderBy: { name: 'asc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.supplier.count(),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier)
      throw new AppException('NOT_FOUND', 'Fornecedor não encontrado.');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...dto,
        document: dto.document ? onlyDigits(dto.document) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
    return { success: true };
  }
}
