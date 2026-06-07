import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { onlyDigits } from '../../common/validators/br-document.util';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateEmployeeDto, actorId?: string) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppException('EMAIL_ALREADY_USED');

    const rounds = this.config.get<number>('security.bcryptSaltRounds', 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
        employee: {
          create: {
            fullName: dto.fullName,
            cpf: onlyDigits(dto.cpf),
            email,
            phone: dto.phone,
            whatsapp: dto.whatsapp,
            position: dto.position,
            admissionDate: dto.admissionDate
              ? new Date(dto.admissionDate)
              : undefined,
            pixKey: dto.pixKey,
            internalNotes: dto.internalNotes,
            defaultCommissionRuleId: dto.defaultCommissionRuleId,
          },
        },
      },
      include: { employee: true },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entity: 'Employee',
      entityId: user.employee?.id,
      after: { email, role: dto.role, fullName: dto.fullName },
    });

    const { passwordHash: _omit, ...safeUser } = user;
    return safeUser;
  }

  async findAll(pg: PaginationQueryDto, active?: boolean) {
    const where: Prisma.EmployeeWhereInput =
      active === undefined ? {} : { active };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, role: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.limit,
      }),
      this.prisma.employee.count({ where }),
    ]);
    return PaginatedResult.of(items, total, pg.page, pg.limit);
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, status: true } },
        defaultCommissionRule: true,
      },
    });
    if (!employee) throw new AppException('EMPLOYEE_NOT_FOUND');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, actorId?: string) {
    const employee = await this.findOne(id);

    const data: Prisma.EmployeeUpdateInput = {
      fullName: dto.fullName,
      cpf: dto.cpf ? onlyDigits(dto.cpf) : undefined,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      position: dto.position,
      admissionDate: dto.admissionDate
        ? new Date(dto.admissionDate)
        : undefined,
      pixKey: dto.pixKey,
      internalNotes: dto.internalNotes,
      active: dto.active,
      defaultCommissionRule: dto.defaultCommissionRuleId
        ? { connect: { id: dto.defaultCommissionRuleId } }
        : undefined,
    };

    const updated = await this.prisma.employee.update({ where: { id }, data });

    // Keep the linked user role/status in sync where relevant.
    if (dto.role || dto.active !== undefined) {
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: {
          role: dto.role,
          status: dto.active === false ? 'INACTIVE' : undefined,
        },
      });
    }

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Employee',
      entityId: id,
      before: employee,
      after: updated,
    });
    return updated;
  }

  async deactivate(id: string, actorId?: string) {
    const employee = await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.employee.update({ where: { id }, data: { active: false } }),
      this.prisma.user.update({
        where: { id: employee.userId },
        data: { status: 'INACTIVE' },
      }),
    ]);
    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entity: 'Employee',
      entityId: id,
      reason: 'deactivated',
    });
    return { id, active: false };
  }
}
