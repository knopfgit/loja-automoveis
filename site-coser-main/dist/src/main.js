"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = require("fs");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: false,
    });
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    const prefix = config.get('app.globalPrefix', 'api');
    app.setGlobalPrefix(prefix, {
        exclude: ['/'],
    });
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://cdn.simpleicons.org'],
                connectSrc: ["'self'", 'http://localhost:3000', 'ws://localhost:3000', 'wss:'],
                fontSrc: ["'self'", 'data:'],
            },
        },
    }));
    app.use((0, cookie_parser_1.default)());
    const corsOrigins = config.get('security.corsOrigins', ['*']);
    app.enableCors({
        origin: corsOrigins.includes('*') ? true : corsOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.enableShutdownHooks();
    const storagePath = (0, path_1.join)(process.cwd(), config.get('storage.localPath', './storage').replace(/^\.\//, ''));
    app.useStaticAssets(storagePath, { prefix: '/uploads/' });
    const configuredFrontendPath = process.env.FRONTEND_DIST_PATH ?? '../site-coser-frontend/dist';
    const frontendDistPath = (0, path_1.isAbsolute)(configuredFrontendPath)
        ? configuredFrontendPath
        : (0, path_1.resolve)(process.cwd(), configuredFrontendPath);
    const frontendIndexPath = (0, path_1.join)(frontendDistPath, 'index.html');
    if ((0, fs_1.existsSync)(frontendIndexPath)) {
        app.useStaticAssets(frontendDistPath, { index: false });
        app
            .getHttpAdapter()
            .getInstance()
            .get(/^\/(?!api(?:\/|$)|docs(?:\/|$)|uploads(?:\/|$)|realtime(?:\/|$)|socket\.io(?:\/|$)).*/, (_request, response) => response.sendFile(frontendIndexPath));
    }
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Auto Dealer API')
        .setDescription('API REST para plataforma de compra e venda de veículos. ' +
        'Respostas seguem o envelope { success, data, meta }. ' +
        'Autentique-se em POST /api/auth/login e use o token Bearer.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Auth')
        .addTag('Public')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = config.get('app.port', 3000);
    await app.listen(port);
    if ((0, fs_1.existsSync)(frontendIndexPath)) {
        logger.log(`Frontend:      http://localhost:${port}`);
    }
    logger.log(`🚀 API running on http://localhost:${port}/${prefix}`);
    logger.log(`📚 Swagger UI:    http://localhost:${port}/docs`);
    logger.log(`🔌 WebSocket:     ws://localhost:${port}/realtime`);
}
bootstrap();
//# sourceMappingURL=main.js.map