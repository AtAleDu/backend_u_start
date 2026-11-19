import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../../common/decorators/sanitize-text.decorator';

export class RejectTaskDto {
  @ApiProperty({
    example: 'Описание содержит недопустимый контент',
    minLength: 5,
    maxLength: 1000,
  })
  @SanitizeText()
  @IsString({ message: 'Укажите причину отклонения' })
  @MinLength(5, { message: 'Причина отклонения слишком короткая' })
  @MaxLength(1000, { message: 'Причина отклонения слишком длинная' })
  reason!: string;
}
