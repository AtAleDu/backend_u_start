import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskApplicationDto } from './dto/create-task-application.dto';
import type { StudentApplicationsTabStatus } from './dto/find-student-applications-query.dto';
import { getStudentByUserId } from './lib/get-student-by-user-id';
import { getStudentApplicationsWhereFilter } from './lib/get-student-applications-status-filter';
import {
  mapStudentApplicationResponse,
  type StudentApplicationResponse,
} from './lib/map-student-application-response';
import {
  mapTaskApplicationResponse,
  type TaskApplicationResponse,
} from './lib/map-task-application-response';
import { mapTaskResponse, type TaskResponse } from './lib/map-task-response';

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

  async findMyApplications(
    userId: string,
    tabStatus: StudentApplicationsTabStatus = 'active',
  ): Promise<StudentApplicationResponse[]> {
    const student = await getStudentByUserId(this.prisma, userId);
    const where = getStudentApplicationsWhereFilter(tabStatus);

    const applications = await this.prisma.taskApplication.findMany({
      where: {
        studentId: student.id,
        ...where,
      },
      include: {
        task: {
          include: {
            company: {
              select: { companyName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map(mapStudentApplicationResponse);
  }

  async findStudentTask(userId: string, taskId: string): Promise<TaskResponse> {
    const student = await getStudentByUserId(this.prisma, userId);

    const application = await this.prisma.taskApplication.findUnique({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id,
        },
      },
    });

    if (!application || application.status !== ApplicationStatus.ACCEPTED) {
      throw new NotFoundException('Задание не найдено');
    }

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      },
      include: {
        company: {
          select: { companyName: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    return mapTaskResponse(task);
  }
}
