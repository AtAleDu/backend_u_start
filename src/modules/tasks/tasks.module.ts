import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyTasksController } from './company-tasks.controller';
import { CompanyTasksService } from './company-tasks.service';
import { PublicTasksController } from './public-tasks.controller';
import { PublicTasksService } from './public-tasks.service';
import { StudentTasksController } from './student-tasks.controller';
import { StudentTasksService } from './student-tasks.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    PublicTasksController,
    CompanyTasksController,
    StudentTasksController,
  ],
  providers: [PublicTasksService, CompanyTasksService, StudentTasksService],
})
export class TasksModule {}
