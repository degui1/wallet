import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcryptjs';
import { IUserRepository } from './repositories/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async create({ name, email, password }: CreateUserDto) {
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new ConflictException('User already exists.');
    }

    const password_hash = await hash(password, 6);

    const user = await this.userRepository.create({
      name,
      email,
      password_hash,
    });

    return {
      user,
    };
  }
}
