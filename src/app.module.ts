import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';

// Global infrastructure
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { AuditModule } from './audit/audit.module';
import { RealtimeModule } from './realtime/realtime.module';
import { FinancialModule } from './modules/financial/financial.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { CustomersModule } from './modules/customers/customers.module';
import { VehicleSpecsModule } from './modules/vehicle-specs/vehicle-specs.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { PartsModule } from './modules/parts/parts.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { CommercialModule } from './modules/commercial/commercial.module';
import { StoreModule } from './modules/store/store.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PublicModule } from './modules/public/public.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JobsModule } from './modules/jobs/jobs.module';

// Global cross-cutting providers
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '120', 10),
      },
    ]),

    // Global infrastructure
    PrismaModule,
    RedisModule,
    StorageModule,
    MailModule,
    AuditModule,
    RealtimeModule,
    FinancialModule,
    NotificationsModule,

    // Feature modules
    AuthModule,
    UsersModule,
    EmployeesModule,
    CustomersModule,
    VehicleSpecsModule,
    VehiclesModule,
    PartsModule,
    MaintenanceModule,
    DocumentsModule,
    CommissionsModule,
    CommercialModule,
    StoreModule,
    LeadsModule,
    PrivacyModule,
    DashboardModule,
    PublicModule,
    ReportsModule,
    JobsModule,
  ],
  providers: [
    // Order matters: throttling -> authentication -> authorization
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
