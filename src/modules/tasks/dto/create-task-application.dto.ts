import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../../common/decorators/sanitize-text.decorator';

export class CreateTaskApplicationDto {
  @ApiProperty({
    example:
      'Готов выполнить задачу в указанные сроки. Есть опыт в React и TypeScript.',
  })
  @SanitizeText()
  @IsString({ message: 'Введите сообщение' })
  @MinLength(50, { message: 'Минимум 50 символов' })
  @MaxLength(250, { message: 'Максимум 250 символов' })
  message!: string;
}
