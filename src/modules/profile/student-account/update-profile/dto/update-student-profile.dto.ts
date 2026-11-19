import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../../../../common/decorators/sanitize-text.decorator';

export class UpdateStudentProfileDto {
  @ApiProperty({
    example: 'Студент 3 курса, интересуюсь веб-разработкой и дизайном.',
  })
  @SanitizeText()
  @IsString({ message: 'Расскажите о себе' })
  @MinLength(1, { message: 'Расскажите о себе' })
  @MaxLength(400, { message: 'Максимум 400 символов' })
  aboutMe!: string;

  @ApiProperty({ example: 'TypeScript, React, Figma, коммуникация' })
  @SanitizeText()
  @IsString({ message: 'Укажите навыки' })
  @MinLength(1, { message: 'Укажите навыки' })
  @MaxLength(400, { message: 'Максимум 400 символов' })
  skills!: string;
}
