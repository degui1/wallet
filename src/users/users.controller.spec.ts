import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to create a user', async () => {
    const { user } = await controller.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: '123456',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe('johndoe@example.com');
    expect(user.name).toBe('John Doe');
  });
});
