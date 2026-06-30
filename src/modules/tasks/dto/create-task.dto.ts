import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ example: 'Верстка лендинга' })
  @IsString({ message: 'Введите название задания' })
  @MinLength(3, { message: 'Минимум 3 символа' })
  @MaxLength(50, { message: 'Максимум 50 символов' })
  title: string;

  @ApiProperty({
    example: 'Нужно сверстать адаптивный лендинг по макету в Figma.',
  })
  @IsString({ message: 'Введите описание' })
  @MinLength(10, { message: 'Минимум 10 символов' })
  @MaxLength(1000, { message: 'Максимум 1000 символов' })
  description: string;

  @ApiProperty({ example: 15000, description: 'Сумма в рублях' })
  @Type(() => Number)
  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(1, { message: 'Минимальная цена — 1 ₽' })
  @Max(999999, { message: 'Максимум 6 цифр' })
  price: number;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsISO8601({}, { message: 'Некорректная дата дедлайна' })
  deadline: string;

  @ApiPropertyOptional({
    example: ['https://s3.twcstorage.ru/u-start/tasks/file.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'fileUrls должен быть массивом' })
  @IsUrl(
    {},
    { each: true, message: 'Каждый файл должен быть корректной ссылкой' },
  )
  fileUrls?: string[];
}
