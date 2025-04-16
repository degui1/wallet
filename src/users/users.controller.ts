import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../utils/decorators/public';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { user } = await this.usersService.create(createUserDto);

    return {
      user: {
        name: user.name,
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    };
  }
}
