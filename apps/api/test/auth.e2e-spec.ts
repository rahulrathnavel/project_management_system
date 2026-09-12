import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import cookieParser from 'cookie-parser';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany(); // clean up
    await app.close();
  });

  const testUser = {
    fullName: 'Test User',
    email: 'testauth@example.com',
    password: 'Password123!',
  };

  it('/auth/register (POST) - success', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    expect(res.body.message).toBeDefined();
    expect(res.body.userId).toBeDefined();
  });

  it('/auth/login (POST) - success & receives cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.user.email).toBe(testUser.email);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('Authentication=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('/auth/register (POST) - rejects role tampering', async () => {
    const maliciousUser = {
      fullName: 'Hacker User',
      email: 'hacker@example.com',
      password: 'Password123!',
      role: 'ADMIN',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(maliciousUser)
      .expect(400);

    expect(res.body.message).toContain('property role should not exist');
  });

  // it('Rate Limiting - should return 429 after 10 requests', async () => {
  //   let status = 200;
  //   for (let i = 0; i < 15; i++) {
  //     const res = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send({ email: 'wrong@example.com', password: 'wrong' });
  //     status = res.status;
  //     if (status === 429) break;
  //   }
  //   expect(status).toBe(429);
  // });
});
