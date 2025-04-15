import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create({ name, email, password }: CreateUserDto) {
    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new ConflictException('User already exists.');
    }

    const password_hash = await hash(password, 6);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });

    return {
      user,
    };
  }
}
