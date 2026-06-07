import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { onlyDigits } from '../../common/validators/br-document.util';
import {
  AddressDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateMyProfileDto,
} from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateCustomerDto, actorId?: string) {
    const document = onlyDigits(dto.document);
    const existing = await this.prisma.customer.findUnique({
      where: { document },
    });
    if (existing) {
      throw new AppException(
        'CONFLICT',
        'Cliente com este documento já existe.',
      );
    }

    const customer = await this.prisma.customer.create({
      data: {
        fullName: dto.fullName,
        document,
        personType:
          dto.personType ?? (document.length === 14 ? 'COMPANY' : 'INDIVIDUAL'),
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        marketingConsent: dto.marketingConsent ?? false,
        cookieConsent: dto.cookieConsent ?? false,
        addresses: dto.address
          ? { create: { ...dto.address, isPrimary: true } }
          : undefined,
      },
      include: { addresses: true },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Customer',
      entityId: customer.id,
      after: { fullName: dto.fullName },
    });
    return customer;
  }

  async findAll(pg: PaginationQueryDto, search?: string) {
    const where: Prisma.CustomerWhereInput = {
      anonymizedAt: null,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { document: { contains: onlyDigits(search) } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { addresses: true },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { addresses: true, marketingPreference: true },
    });
    if (!customer) throw new AppException('CUSTOMER_NOT_FOUND');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        document: dto.document ? onlyDigits(dto.document) : undefined,
        personType: dto.personType,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        marketingConsent: dto.marketingConsent,
        cookieConsent: dto.cookieConsent,
      },
      include: { addresses: true },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Customer',
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  }

  // ---- self-service (CUSTOMER) ----
  async getMe(customerId: string) {
    return this.findOne(customerId);
  }

  async updateMe(customerId: string, dto: UpdateMyProfileDto) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email?.toLowerCase(),
        marketingConsent: dto.marketingConsent,
      },
      include: { addresses: true },
    });
  }

  // ---- addresses ----
  async addAddress(customerId: string, dto: AddressDto) {
    await this.findOne(customerId);
    return this.prisma.address.create({
      data: { ...dto, customerId },
    });
  }

  async updateAddress(customerId: string, addressId: string, dto: AddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address)
      throw new AppException('NOT_FOUND', 'Endereço não encontrado.');
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async removeAddress(customerId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address)
      throw new AppException('NOT_FOUND', 'Endereço não encontrado.');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true };
  }
}
