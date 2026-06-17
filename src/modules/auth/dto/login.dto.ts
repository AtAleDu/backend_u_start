import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@test.com' })
  @IsEmail({}, { message: 'Введите корректный e-mail' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'Введите пароль' })
  @MaxLength(72, { message: 'Пароль слишком длинный' })
  password: string;
}
