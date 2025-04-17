import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UsersModule } from '../src/users/users.module';
import {
  generateTestSchema,
  setup,
  teardown,
} from '../src/utils/prisma-test-environment';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let schema: string;

  beforeAll(async () => {
    schema = generateTestSchema();
    setup(schema);

    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    await teardown(schema);
    await app.close();
  });
});
