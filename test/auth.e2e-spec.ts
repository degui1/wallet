/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  generateTestSchema,
  getPrisma,
  setup,
  teardown,
} from '../src/utils/prisma-test-environment';
import { AuthModule } from '../src/auth/auth.module';
import { hash } from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let schema: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    schema = generateTestSchema();
    setup(schema);
    prisma = getPrisma(schema);

    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/sign-in (POST)', async () => {
    const password_hash = await hash('123456', 6);
    await prisma.user.create({
      data: {
        email: 'johndoeAUTHTEST@example.com',
        password_hash,
        name: 'John Doe',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'johndoeAUTHTEST@example.com',
        password: '123456',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
      }),
    );
  });

  afterAll(async () => {
    await teardown(schema);
    await app.close();
  });
});
