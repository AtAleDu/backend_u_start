import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTasksService } from './public-tasks.service';

@ApiTags('Tasks')
@Controller('tasks/public')
export class PublicTasksController {
  constructor(private readonly service: PublicTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Публичный список открытых заданий' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Публичная карточка задания' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
