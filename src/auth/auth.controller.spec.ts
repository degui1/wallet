import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { InMemoryUserRepository } from '../users/repositories/in-memory/in-memory-user.repository';
import { hash } from 'bcryptjs';

describe('AuthController', () => {
  let controller: AuthController;
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
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: 'IUserRepository',
          useValue: inMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to sign-in', async () => {
    const password_hash = await hash('123456', 6);

    const user = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const { access_token } = await controller.signIn({
      email: user.email,
      password: '123456',
    });

    const jwtService = new JwtService({ secret: 'test-secret' });

    const { sub } = jwtService.verify<{ sub: string }>(access_token);

    expect(sub).toBe(user.id);
  });
});
