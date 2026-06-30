import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, TaskStatus } from '@prisma/client';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { UPLOAD_TASK_FILE } from '../../infrastructure/upload/upload-constraints';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import type { CompanyTasksTabStatus } from './dto/find-company-tasks-query.dto';
import { getCompanyByUserId } from './lib/get-company-by-user-id';
import { getCompanyTasksStatusFilter } from './lib/get-company-tasks-status-filter';
import { mapTaskResponse } from './lib/map-task-response';
import type { TaskResponse } from './lib/map-task-response';
import {
  mapTaskApplicationResponse,
  type TaskApplicationResponse,
} from './lib/map-task-application-response';

type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Injectable()
export class CompanyTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadFile(
    userId: string,
    file: UploadedFile | undefined,
  ): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('Файл не передан');
    }

    const company = await getCompanyByUserId(this.prisma, userId);
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      },
      {
        allowedMimeTypes: UPLOAD_TASK_FILE.allowedMimeTypes,
        maxSizeBytes: UPLOAD_TASK_FILE.maxSizeBytes,
        isPublic: true,
        pathPrefix: `tasks/${company.id}`,
      },
    );

    return { url: uploadResult.url };
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);
    const fileUrls = dto.fileUrls ?? [];

    for (const url of fileUrls) {
      if (!this.storage.isOwnPublicUrl(url)) {
        throw new BadRequestException('Недопустимая ссылка на файл');
      }
    }

    const deadline = new Date(dto.deadline);
    if (Number.isNaN(deadline.getTime())) {
      throw new BadRequestException('Некорректная дата дедлайна');
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (deadline.getTime() < startOfToday.getTime()) {
      throw new BadRequestException('Дедлайн не может быть в прошлом');
    }

    const task = await this.prisma.task.create({
      data: {
        companyId: company.id,
        title: dto.title.trim(),
        description: dto.description.trim(),
        price: dto.price,
        deadline,
        fileUrls,
        status: TaskStatus.OPEN,
      },
      include: {
        company: {
          select: { companyName: true },
        },
      },
    });

    return mapTaskResponse(task);
  }

  async findMyTasks(
    userId: string,
    status?: CompanyTasksTabStatus,
  ): Promise<TaskResponse[]> {
    const company = await getCompanyByUserId(this.prisma, userId);
    const statusFilter = getCompanyTasksStatusFilter(status);

    const tasks = await this.prisma.task.findMany({
      where: {
        companyId: company.id,
        ...(statusFilter ? { status: { in: statusFilter } } : {}),
      },
      include: {
        company: {
          select: { companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(mapTaskResponse);
  }

  async findOne(userId: string, id: string): Promise<TaskResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id, companyId: company.id },
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

  async findApplications(
    userId: string,
    taskId: string,
  ): Promise<TaskApplicationResponse[]> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId: company.id },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    const applications = await this.prisma.taskApplication.findMany({
      where: { taskId },
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
      orderBy: { createdAt: 'desc' },
    });

    return applications.map(mapTaskApplicationResponse);
  }

  async acceptApplication(
    userId: string,
    taskId: string,
    applicationId: string,
  ): Promise<TaskResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId: company.id },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.status !== TaskStatus.OPEN) {
      throw new BadRequestException('Исполнитель уже выбран');
    }

    const application = await this.prisma.taskApplication.findFirst({
      where: { id: applicationId, taskId },
      select: { id: true, status: true },
    });

    if (!application) {
      throw new NotFoundException('Отклик не найден');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Отклик уже обработан');
    }

    await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.IN_PROGRESS },
      }),
      this.prisma.taskApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.ACCEPTED },
      }),
      this.prisma.taskApplication.updateMany({
        where: {
          taskId,
          id: { not: applicationId },
          status: ApplicationStatus.PENDING,
        },
        data: { status: ApplicationStatus.REJECTED },
      }),
    ]);

    return this.findOne(userId, taskId);
  }

  async findAcceptedApplication(
    userId: string,
    taskId: string,
  ): Promise<TaskApplicationResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId: company.id },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (
      task.status !== TaskStatus.IN_PROGRESS &&
      task.status !== TaskStatus.COMPLETED
    ) {
      throw new BadRequestException('Исполнитель ещё не выбран');
    }

    const application = await this.prisma.taskApplication.findFirst({
      where: {
        taskId,
        status: ApplicationStatus.ACCEPTED,
      },
      include: {
        student: {
          select: {
            ratingSum: true,
            ratingCount: true,
            user: {
              select: { name: true, surname: true, email: true },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Исполнитель не найден');
    }

    return mapTaskApplicationResponse(application);
  }

  async completeTask(
    userId: string,
    taskId: string,
    dto: CompleteTaskDto,
  ): Promise<TaskResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId: company.id },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Задание не находится в работе');
    }

    const acceptedApplication = await this.prisma.taskApplication.findFirst({
      where: { taskId, status: ApplicationStatus.ACCEPTED },
      select: { id: true, studentId: true },
    });

    if (!acceptedApplication) {
      throw new BadRequestException('Исполнитель не найден');
    }

    await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          rating: dto.rating,
        },
      }),
      this.prisma.student.update({
        where: { id: acceptedApplication.studentId },
        data: {
          ratingSum: { increment: dto.rating },
          ratingCount: { increment: 1 },
        },
      }),
    ]);

    return this.findOne(userId, taskId);
  }

  async rejectWork(userId: string, taskId: string): Promise<TaskResponse> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId: company.id },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Задание не находится в работе');
    }

    const acceptedApplication = await this.prisma.taskApplication.findFirst({
      where: { taskId, status: ApplicationStatus.ACCEPTED },
      select: { id: true },
    });

    if (!acceptedApplication) {
      throw new BadRequestException('Исполнитель не найден');
    }

    await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.OPEN, rating: null },
      }),
      this.prisma.taskApplication.updateMany({
        where: {
          taskId,
          status: ApplicationStatus.REJECTED,
        },
        data: { status: ApplicationStatus.PENDING },
      }),
      this.prisma.taskApplication.update({
        where: { id: acceptedApplication.id },
        data: { status: ApplicationStatus.REJECTED },
      }),
    ]);

    return this.findOne(userId, taskId);
  }

  async remove(userId: string, id: string): Promise<void> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const task = await this.prisma.task.findFirst({
      where: { id, companyId: company.id },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    await this.prisma.task.delete({ where: { id } });
  }
}
