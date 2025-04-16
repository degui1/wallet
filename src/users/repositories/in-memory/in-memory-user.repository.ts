import { IUserRepository } from '../user.repository.interface';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { Prisma, User } from '../../../../generated/prisma';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  create(data: Prisma.UserCreateInput) {
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
      updated_at: new Date(),
      balance: new Prisma.Decimal('0'),
    };

    this.users.push(user);

    return user;
  }

  findByEmail(email: string) {
    const user = this.users.find((user) => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }
}
