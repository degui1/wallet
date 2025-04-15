import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepositoryPrisma } from './repositories/user.repository.prisma';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryPrisma,
    },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}
