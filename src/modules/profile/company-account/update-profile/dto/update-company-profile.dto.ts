import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ example: 'ООО Ромашка' })
  @IsOptional()
  @IsString({ message: 'Введите название компании' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(150, { message: 'Максимум 150 символов' })
  companyName?: string;

  @ApiProperty({
    example: 'IT-компания, которая развивает образовательные продукты.',
  })
  @IsString({ message: 'Введите описание' })
  @MinLength(1, { message: 'Введите описание' })
  @MaxLength(400, { message: 'Максимум 400 символов' })
  description: string;

  @ApiPropertyOptional({ example: 'Иван' })
  @IsOptional()
  @IsString({ message: 'Введите имя' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  name?: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsOptional()
  @IsString({ message: 'Введите фамилию' })
  @MinLength(2, { message: 'Минимум 2 символа' })
  @MaxLength(100, { message: 'Максимум 100 символов' })
  surname?: string;
}
