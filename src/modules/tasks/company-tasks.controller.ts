import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  findMyTasks(@CurrentUser() user: SafeUser) {
    return this.service.findMyTasks(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Задание компании по id' })
  findOne(@CurrentUser() user: SafeUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }
}
