import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { mapTaskResponse } from '../tasks/lib/map-task-response';
import type { TaskResponse } from '../tasks/lib/map-task-response';
import { taskCompanySelect } from '../tasks/lib/task-company-select';
import { RejectTaskDto } from './dto/reject-task.dto';

@Injectable()
export class AdminTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending(): Promise<TaskResponse[]> {
    const tasks = await this.prisma.task.findMany({
      where: { status: TaskStatus.PENDING },
      include: {
        company: {
          select: taskCompanySelect,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return tasks.map(mapTaskResponse);
  }

  async approve(taskId: string): Promise<TaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Задание не ожидает модерации');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.OPEN,
        rejectionReason: null,
      },
      include: {
        company: {
          select: taskCompanySelect,
        },
      },
    });

    return mapTaskResponse(updated);
  }

  async reject(taskId: string, dto: RejectTaskDto): Promise<TaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Задание не ожидает модерации');
    }

    const reason = dto.reason.trim();
    if (!reason) {
      throw new BadRequestException('Укажите причину отклонения');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        company: {
          select: taskCompanySelect,
        },
      },
    });

    return mapTaskResponse(updated);
  }
}
