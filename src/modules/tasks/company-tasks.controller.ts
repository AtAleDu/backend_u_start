import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { SafeUser } from '../../common/types/user.types';
import { CompanyTasksService } from './company-tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { FindCompanyTasksQueryDto } from './dto/find-company-tasks-query.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class CompanyTasksController {
  constructor(private readonly service: CompanyTasksService) {}

  @Post('upload-file')
  @ApiOperation({ summary: 'Загрузить файл к заданию' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  uploadFile(
    @CurrentUser() user: SafeUser,
    @UploadedFile()
    file:
      | {
          buffer: Buffer;
          mimetype: string;
          size: number;
          originalname: string;
        }
      | undefined,
  ) {
    return this.service.uploadFile(user.id, file);
  }

  @Post()
  @ApiOperation({ summary: 'Создать задание' })
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateTaskDto) {
    return this.service.create(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Список заданий компании' })
  findMyTasks(
    @CurrentUser() user: SafeUser,
    @Query() query: FindCompanyTasksQueryDto,
  ) {
    return this.service.findMyTasks(user.id, query.status);
  }

  @Post(':id/applications/:applicationId/accept')
  @ApiOperation({ summary: 'Выбрать студента для задания' })
  acceptApplication(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Param('applicationId') applicationId: string,
  ) {
    return this.service.acceptApplication(user.id, id, applicationId);
  }

  @Get(':id/accepted-application')
  @ApiOperation({ summary: 'Принятый исполнитель задания' })
  findAcceptedApplication(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ) {
    return this.service.findAcceptedApplication(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Принять работу и завершить задание' })
  completeTask(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.service.completeTask(user.id, id, dto);
  }

  @Post(':id/reject-work')
  @ApiOperation({ summary: 'Отклонить работу и вернуть задание в активные' })
  rejectWork(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.rejectWork(user.id, id);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Отклики на задание компании' })
  findApplications(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.findApplications(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Задание компании по id' })
  findOne(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задание компании' })
  remove(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}
