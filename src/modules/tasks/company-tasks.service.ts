import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { UPLOAD_TASK_FILE } from '../../infrastructure/upload/upload-constraints';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { getCompanyByUserId } from './lib/get-company-by-user-id';
import { mapTaskResponse } from './lib/map-task-response';
import type { TaskResponse } from './lib/map-task-response';

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

  async findMyTasks(userId: string): Promise<TaskResponse[]> {
    const company = await getCompanyByUserId(this.prisma, userId);

    const tasks = await this.prisma.task.findMany({
      where: { companyId: company.id },
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
}
