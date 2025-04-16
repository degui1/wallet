import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from 'src/users/repositories/user.repository.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
