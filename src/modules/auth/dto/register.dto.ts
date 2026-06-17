import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'student@test.com' })
  @IsEmail({}, { message: 'Введите корректный e-mail' })
  email: string;

  @ApiProperty({ example: 'Artur' })
  @IsString({ message: 'Введите имя' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  name: string;

  @ApiProperty({ example: 'Petrov' })
  @IsString({ message: 'Введите фамилию' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  surname: string;

  @ApiProperty({ example: 'password1' })
  @IsString({ message: 'Введите пароль' })
  @MinLength(8, { message: 'Минимум 8 символов' })
  @MaxLength(72, { message: 'Пароль слишком длинный' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Пароль должен содержать буквы и цифры',
  })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole, { message: 'Выберите корректную роль' })
  role: UserRole;
}
