import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskApplicationDto } from './dto/create-task-application.dto';
import { getStudentByUserId } from './lib/get-student-by-user-id';
import {
  mapTaskApplicationResponse,
  type TaskApplicationResponse,
} from './lib/map-task-application-response';

@Injectable()
export class StudentTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(
    userId: string,
    taskId: string,
    dto: CreateTaskApplicationDto,
  ): Promise<TaskApplicationResponse> {
    const student = await getStudentByUserId(this.prisma, userId);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true, companyId: true },
    });

    if (!task || task.status !== TaskStatus.OPEN) {
      throw new NotFoundException('Задание не найдено');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: task.companyId },
      select: { userId: true },
    });

    if (company?.userId === userId) {
      throw new BadRequestException(
        'Нельзя откликаться на собственное задание',
      );
    }

    const existingApplication = await this.prisma.taskApplication.findUnique({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Вы уже откликнулись на это задание');
    }

    const message = dto.message.trim();

    const application = await this.prisma.taskApplication.create({
      data: {
        taskId,
        studentId: student.id,
        message,
      },
      include: {
        student: {
          select: {
            ratingSum: true,
            ratingCount: true,
            user: {
              select: { name: true, surname: true },
            },
          },
        },
      },
    });

    return mapTaskApplicationResponse(application);
  }

  async findMyApplication(
    userId: string,
    taskId: string,
  ): Promise<TaskApplicationResponse | null> {
    const student = await getStudentByUserId(this.prisma, userId);

    const application = await this.prisma.taskApplication.findUnique({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id,
        },
      },
      include: {
        student: {
          select: {
            ratingSum: true,
            ratingCount: true,
            user: {
              select: { name: true, surname: true },
            },
          },
        },
      },
    });

    return application ? mapTaskApplicationResponse(application) : null;
  }
}
