import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const prefix = config.get<string>('app.globalPrefix', 'api');
  app.setGlobalPrefix(prefix, {
    exclude: ['/'],
  });

  // Security
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cookieParser());

  const corsOrigins = config.get<string[]>('security.corsOrigins', ['*']);
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  });

  // Validation + serialization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableShutdownHooks();

  // Static serving for locally stored uploads (dev driver).
  const storagePath = join(
    process.cwd(),
    config.get<string>('storage.localPath', './storage').replace(/^\.\//, ''),
  );
  app.useStaticAssets(storagePath, { prefix: '/uploads/' });

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auto Dealer API')
    .setDescription(
      'API REST para plataforma de compra e venda de veículos. ' +
        'Respostas seguem o envelope { success, data, meta }. ' +
        'Autentique-se em POST /api/auth/login e use o token Bearer.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Public')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`🚀 API running on http://localhost:${port}/${prefix}`);
  logger.log(`📚 Swagger UI:    http://localhost:${port}/docs`);
  logger.log(`🔌 WebSocket:     ws://localhost:${port}/realtime`);
}

bootstrap();
