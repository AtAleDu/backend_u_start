import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'student@test.com' })
  @IsEmail({}, { message: 'Введите корректный e-mail' })
  email: string;

  @ApiPropertyOptional({ example: 'Artur' })
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.STUDENT)
  @IsString({ message: 'Введите имя' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  name?: string;

  @ApiPropertyOptional({ example: 'Petrov' })
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.STUDENT)
  @IsString({ message: 'Введите фамилию' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  surname?: string;

  @ApiPropertyOptional({ example: 'ООО Ромашка' })
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.COMPANY)
  @IsString({ message: 'Введите название компании' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(150, { message: 'Максимум 150 символов' })
  companyName?: string;

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
