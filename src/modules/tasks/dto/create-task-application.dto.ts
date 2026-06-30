import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskApplicationDto {
  @ApiProperty({
    example:
      'Готов выполнить задачу в указанные сроки. Есть опыт в React и TypeScript.',
  })
  @IsString({ message: 'Введите сообщение' })
  @MinLength(50, { message: 'Минимум 50 символов' })
  @MaxLength(250, { message: 'Максимум 250 символов' })
  message: string;
}
