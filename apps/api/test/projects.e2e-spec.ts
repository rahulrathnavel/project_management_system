import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import cookieParser from 'cookie-parser';

describe('ProjectsModule IDOR (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let cookieA: string[];
  let cookieB: string[];
  let projectAId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up
    await prisma.user.deleteMany();

    // Create User A
    await request(app.getHttpServer()).post('/auth/register').send({
      fullName: 'User A', email: 'a@test.com', password: 'Password123!'
    });
    const resA = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'a@test.com', password: 'Password123!'
    });
    cookieA = resA.headers['set-cookie'];

    // Create User B
    await request(app.getHttpServer()).post('/auth/register').send({
      fullName: 'User B', email: 'b@test.com', password: 'Password123!'
    });
    const resB = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'b@test.com', password: 'Password123!'
    });
    cookieB = resB.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('User A creates a project', async () => {
    const res = await request(app.getHttpServer())
      .post('/projects')
      .set('Cookie', cookieA)
      .send({ name: 'Project A' })
      .expect(201);
    
    projectAId = res.body.id;
    expect(projectAId).toBeDefined();
  });

  it('User B CANNOT access User A project (IDOR Check)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectAId}`)
      .set('Cookie', cookieB)
      .expect(403);
    
    expect(res.body.message).toBe('Access denied');
  });

  it('User B CANNOT update User A project', async () => {
    await request(app.getHttpServer())
      .put(`/projects/${projectAId}`)
      .set('Cookie', cookieB)
      .send({ name: 'Hacked Project' })
      .expect(403);
  });
});

