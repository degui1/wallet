import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { InMemoryUserRepository } from '../users/repositories/in-memory/in-memory-user.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let inMemoryUserRepository: InMemoryUserRepository;

  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
      providers: [
        AuthService,
        AuthGuard,
        {
          provide: APP_GUARD,
          useExisting: AuthGuard,
        },
        {
          provide: 'IUserRepository',
          useValue: inMemoryUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to sign-in', async () => {
    const password_hash = await hash('123456', 6);

    const sender = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const { access_token } = await service.signIn(sender.email, '123456');

    expect(access_token).toBeDefined();
    expect(access_token).toEqual(expect.any(String));
  });

  it('not should be able to sign-in a user with invalid email', async () => {
    await expect(() =>
      service.signIn('error@example.com', '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('not should be able to sign-in a user with invalid email', async () => {
    const password_hash = await hash('123456', 6);

    const sender = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    await expect(() =>
      service.signIn(sender.email, 'invalid password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
