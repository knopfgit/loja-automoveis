import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

/**
 * End-to-end tests. REQUIRES infrastructure running:
 *   docker compose up -d && npx prisma migrate deploy && npx prisma db seed
 *
 * Validates the full HTTP stack: standard envelope, auth flow, RBAC and that
 * public endpoints never expose internal vehicle fields.
 */
describe('Auto Dealer API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/public/vehicles returns the standard list envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/vehicles')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('total');
  });

  it('public vehicles never expose internal fields', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/vehicles')
      .expect(200);
    for (const vehicle of res.body.data) {
      expect(vehicle).not.toHaveProperty('purchasePrice');
      expect(vehicle).not.toHaveProperty('minPrice');
      expect(vehicle).not.toHaveProperty('internalNotes');
      expect(vehicle).not.toHaveProperty('plate');
    }
  });

  it('rejects invalid login with the error envelope', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nope@nope.com', password: 'wrong' })
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in as admin and accesses a protected route', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@autodealer.local', password: 'Admin@123' })
      .expect(201);
    const token = login.body.data.accessToken;
    expect(token).toBeDefined();

    const dash = await request(app.getHttpServer())
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(dash.body.success).toBe(true);
    expect(dash.body.data).toHaveProperty('vehicles');
  });

  it('blocks a customer from admin-only routes (RBAC)', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'maria@cliente.com', password: 'Customer@123' })
      .expect(201);
    const token = login.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('generates a WhatsApp URL from the specialist-contact endpoint', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/leads/specialist-contact')
      .send({ name: 'Visitante Teste', phone: '54988887777' })
      .expect(201);
    expect(res.body.data).toHaveProperty('whatsappUrl');
    expect(res.body.data.whatsappUrl).toContain('wa.me/');
  });
});
