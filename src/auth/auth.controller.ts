import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { Public } from '../utils/decorators/public';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Authenticate an user' })
  @ApiResponse({ status: 201, description: 'User authenticated successfully.' })
  signIn(@Body() signInDto: SignInAuthDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
}
