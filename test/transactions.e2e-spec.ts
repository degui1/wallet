/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

import { PrismaClient } from '../generated/prisma';
import { TransactionsModule } from '../src/transactions/transactions.module';
import { createAndAuthenticateUser } from '../src/utils/create-and-authenticate-user';
import { hash } from 'bcryptjs';
import { AuthModule } from '../src/auth/auth.module';

describe('TransactionController (e2e)', () => {
  let app: INestApplication<App>;
  let schema: string;
  let prisma: PrismaClient;

  beforeEach(async () => {
    schema = generateTestSchema();
    setup(schema);
    prisma = getPrisma(schema);

    const moduleFixture = await Test.createTestingModule({
      imports: [TransactionsModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/transactions (POST)', async () => {
    const { access_token } = await createAndAuthenticateUser(
      app.getHttpServer(),
      prisma,
    );

    const receiver = await prisma.user.create({
      data: {
        email: 'receiver@email.com',
        name: 'Receiver',
        password_hash: await hash('123456', 6),
      },
    });

    const response = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        receiverId: receiver.id,
        amount: 2000,
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction.type).toEqual('TRANSFER');
    expect(response.body.transaction.amount).toEqual('2000');
  });

  it('/transactions/deposit (POST)', async () => {
    const { access_token } = await createAndAuthenticateUser(
      app.getHttpServer(),
      prisma,
    );

    const response = await request(app.getHttpServer())
      .post('/transactions/deposit')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        amount: 2000,
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction.type).toEqual('DEPOSIT');
    expect(response.body.transaction.amount).toEqual('2000');
  });

  it('/transactions/revert (POST)', async () => {
    const { access_token, user } = await createAndAuthenticateUser(
      app.getHttpServer(),
      prisma,
    );

    const receiver = await prisma.user.create({
      data: {
        email: 'receiver@email.com',
        name: 'Receiver',
        password_hash: await hash('123456', 6),
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        amount: 1000,
        type: 'TRANSFER',
        receiver_id: receiver.id,
        sender_id: user.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/transactions/revert')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        transactionId: transaction.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction.type).toEqual('REVERSAL');
    expect(response.body.transaction.amount).toEqual('1000');
  });

  afterEach(async () => {
    await teardown(schema);
    await app.close();
  });
});
