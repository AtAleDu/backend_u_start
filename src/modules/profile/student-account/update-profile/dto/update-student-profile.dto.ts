import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiProperty({
    example: 'Студент 3 курса, интересуюсь веб-разработкой и дизайном.',
  })
  @IsString({ message: 'Расскажите о себе' })
  @MinLength(1, { message: 'Расскажите о себе' })
  @MaxLength(400, { message: 'Максимум 400 символов' })
  aboutMe: string;

  @ApiProperty({ example: 'TypeScript, React, Figma, коммуникация' })
  @IsString({ message: 'Укажите навыки' })
  @MinLength(1, { message: 'Укажите навыки' })
  @MaxLength(400, { message: 'Максимум 400 символов' })
  skills: string;
}
