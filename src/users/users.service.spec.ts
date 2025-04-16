import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';
import { ConflictException } from '@nestjs/common';
import { compare } from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to create a user', async () => {
    const { user } = await service.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    );

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('johndoe@example.com');
    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  it('should not be able to create a user with same email', async () => {
    await service.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    await expect(() =>
      service.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
