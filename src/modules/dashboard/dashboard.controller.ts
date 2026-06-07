import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Dashboard administrativo (indicadores gerais)' })
  admin() {
    return this.service.adminDashboard();
  }

  @Get('seller')
  @Roles('SELLER')
  @ApiOperation({ summary: 'Dashboard do vendedor (seus indicadores)' })
  seller(@CurrentUser() user: AuthUser) {
    if (!user.employeeId) throw new AppException('EMPLOYEE_NOT_FOUND');
    return this.service.sellerDashboard(user.employeeId);
  }
}
