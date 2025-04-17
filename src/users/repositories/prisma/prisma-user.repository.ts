import { Prisma, User } from '../../../../generated/prisma';
import { IUserRepository } from '../user.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({ data });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    return user;
  }
}
