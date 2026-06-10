"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = __importDefault(require("./config/configuration"));
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const storage_module_1 = require("./storage/storage.module");
const mail_module_1 = require("./mail/mail.module");
const audit_module_1 = require("./audit/audit.module");
const realtime_module_1 = require("./realtime/realtime.module");
const financial_module_1 = require("./modules/financial/financial.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const employees_module_1 = require("./modules/employees/employees.module");
const customers_module_1 = require("./modules/customers/customers.module");
const vehicle_specs_module_1 = require("./modules/vehicle-specs/vehicle-specs.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const parts_module_1 = require("./modules/parts/parts.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const documents_module_1 = require("./modules/documents/documents.module");
const commissions_module_1 = require("./modules/commissions/commissions.module");
const commercial_module_1 = require("./modules/commercial/commercial.module");
const store_module_1 = require("./modules/store/store.module");
const leads_module_1 = require("./modules/leads/leads.module");
const privacy_module_1 = require("./modules/privacy/privacy.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const public_module_1 = require("./modules/public/public.module");
const reports_module_1 = require("./modules/reports/reports.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default] }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || '120', 10),
                },
            ]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            storage_module_1.StorageModule,
            mail_module_1.MailModule,
            audit_module_1.AuditModule,
            realtime_module_1.RealtimeModule,
            financial_module_1.FinancialModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            customers_module_1.CustomersModule,
            vehicle_specs_module_1.VehicleSpecsModule,
            vehicles_module_1.VehiclesModule,
            parts_module_1.PartsModule,
            maintenance_module_1.MaintenanceModule,
            documents_module_1.DocumentsModule,
            commissions_module_1.CommissionsModule,
            commercial_module_1.CommercialModule,
            store_module_1.StoreModule,
            leads_module_1.LeadsModule,
            privacy_module_1.PrivacyModule,
            dashboard_module_1.DashboardModule,
            public_module_1.PublicModule,
            reports_module_1.ReportsModule,
            jobs_module_1.JobsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map