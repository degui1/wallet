import * as request from 'supertest';
import { hash } from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma';
import { App } from 'supertest/types';

export async function createAndAuthenticateUser(
  app: App,
  prisma: PrismaClient,
) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
      balance: 10000,
    },
  });

  const authResponse = await request(app).post('/auth/sign-in').send({
    email: 'johndoe@example.com',
    password: '123456',
  });

  const { access_token } = authResponse.body as { access_token: string };

  return {
    access_token,
    user,
  };
}
