import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CompleteTaskDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt({ message: 'Рейтинг должен быть целым числом' })
  @Min(1, { message: 'Минимальный рейтинг — 1' })
  @Max(5, { message: 'Максимальный рейтинг — 5' })
  rating: number;
}
