import { ApiProperty } from '@nestjs/swagger';

export class SignInAuthDto {
  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
