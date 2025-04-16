import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUserRepository } from './repositories/prisma/prisma-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class UsersModule {}
