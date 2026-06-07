import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UsersService } from './users.service';
import { RbacService } from './rbac.service';

class SetStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
class CreateRoleDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
}
class SetPermissionsDto {
  @IsArray() permissionIds!: string[];
}
class CreatePermissionDto {
  @IsString() code!: string;
  @IsOptional() @IsString() description?: string;
}

@ApiTags('Users & RBAC')
@ApiBearerAuth()
@Controller()
@Roles('ADMIN')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly rbac: RbacService,
  ) {}

  // ----- users -----
  @Get('users')
  @ApiOperation({ summary: 'Listar usuários (ADMIN)' })
  findAll(
    @Query() pg: PaginationQueryDto,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.users.findAll(pg, role, status);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Ativar / inativar / bloquear usuário' })
  setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.users.setStatus(id, dto.status, user.userId);
  }

  @Get('users/:id/login-history')
  @ApiOperation({ summary: 'Histórico de login do usuário' })
  loginHistory(@Param('id') id: string, @Query() pg: PaginationQueryDto) {
    return this.users.loginHistory(id, pg);
  }

  @Patch('users/:id/role-profile')
  @ApiOperation({ summary: 'Atribuir perfil de permissões ao usuário' })
  assignRoleProfile(
    @Param('id') id: string,
    @Body('roleProfileId') roleProfileId: string | null,
    @CurrentUser() user: AuthUser,
  ) {
    return this.users.assignRoleProfile(id, roleProfileId, user.userId);
  }

  // ----- RBAC roles & permissions -----
  @Get('roles')
  @ApiOperation({ summary: 'Listar perfis de acesso' })
  listRoles() {
    return this.rbac.listRoles();
  }

  @Post('roles')
  @ApiOperation({ summary: 'Criar perfil de acesso' })
  createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthUser) {
    return this.rbac.createRole(dto.name, dto.description, user.userId);
  }

  @Patch('roles/:id/permissions')
  @ApiOperation({ summary: 'Definir permissões de um perfil' })
  setPermissions(
    @Param('id') id: string,
    @Body() dto: SetPermissionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rbac.setRolePermissions(id, dto.permissionIds, user.userId);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Remover perfil de acesso' })
  deleteRole(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.rbac.deleteRole(id, user.userId);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Listar permissões' })
  listPermissions() {
    return this.rbac.listPermissions();
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Criar permissão' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbac.createPermission(dto.code, dto.description);
  }
}
