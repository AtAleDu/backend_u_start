import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentsRatingService } from './students-rating.service';

@ApiTags('Students')
@Controller('students/rating')
export class StudentsRatingController {
  constructor(private readonly service: StudentsRatingService) {}

  @Get()
  @ApiOperation({ summary: 'Публичный рейтинг студентов' })
  findAll() {
    return this.service.findAll();
  }
}
