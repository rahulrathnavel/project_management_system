import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';

describe('AuditModule RBAC (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userCookie: string[];
  let adminCookie: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    // Create Normal User
    const userPass = await bcrypt.hash('Password123!', 10);
    const normalUser = await prisma.user.create({
      data: { email: 'normal@example.com', passwordHash: userPass, fullName: 'Normal User', role: 'USER' },
    });

    // Create Admin User
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const adminUser = await prisma.user.create({
      data: { email: 'admin@example.com', passwordHash: adminPass, fullName: 'Admin User', role: 'ADMIN' },
    });

    // Login Normal User
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'normal@example.com', password: 'Password123!' });
    userCookie = userLogin.headers['set-cookie'];

    // Login Admin User
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin123!' });
    adminCookie = adminLogin.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/audit (GET) - Unauthenticated should return 401', async () => {
    return request(app.getHttpServer())
      .get('/audit')
      .expect(401);
  });

  it('/audit (GET) - USER should return 403 Forbidden', async () => {
    return request(app.getHttpServer())
      .get('/audit')
      .set('Cookie', userCookie)
      .expect(403);
  });

  it('/audit (GET) - ADMIN should return 200 OK', async () => {
    const res = await request(app.getHttpServer())
      .get('/audit')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});

