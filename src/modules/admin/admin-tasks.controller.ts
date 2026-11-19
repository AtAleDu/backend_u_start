import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminTasksService } from './admin-tasks.service';
import { RejectTaskDto } from './dto/reject-task.dto';

@ApiTags('Admin')
@ApiCookieAuth('accessToken')
@Controller('admin/tasks')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminTasksController {
  constructor(private readonly service: AdminTasksService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Задания на модерации' })
  findPending() {
    return this.service.findPending();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Одобрить задание' })
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Отклонить задание' })
  reject(@Param('id') id: string, @Body() dto: RejectTaskDto) {
    return this.service.reject(id, dto);
  }
}
