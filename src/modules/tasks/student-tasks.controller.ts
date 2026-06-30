import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { SafeUser } from '../../common/types/user.types';
import { CreateTaskApplicationDto } from './dto/create-task-application.dto';
import { FindStudentApplicationsQueryDto } from './dto/find-student-applications-query.dto';
import { StudentTasksService } from './student-tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentTasksController {
  constructor(private readonly service: StudentTasksService) {}

  @Get('applications/my')
  @ApiOperation({ summary: 'Мои отклики на задания' })
  findMyApplications(
    @CurrentUser() user: SafeUser,
    @Query() query: FindStudentApplicationsQueryDto,
  ) {
    return this.service.findMyApplications(user.id, query.status);
  }

  @Get(':id/student')
  @ApiOperation({ summary: 'Задание студента в работе' })
  findStudentTask(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.findStudentTask(user.id, id);
  }

  @Get(':id/my-application')
  @ApiOperation({ summary: 'Мой отклик на задание' })
  findMyApplication(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.findMyApplication(user.id, id);
  }

  @Post(':id/applications')
  @ApiOperation({ summary: 'Откликнуться на задание' })
  apply(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: CreateTaskApplicationDto,
  ) {
    return this.service.apply(user.id, id, dto);
  }
}
