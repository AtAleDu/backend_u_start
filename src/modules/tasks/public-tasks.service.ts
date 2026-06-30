import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { mapTaskResponse } from './lib/map-task-response';
import type { TaskResponse } from './lib/map-task-response';

@Injectable()
export class PublicTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.prisma.task.findMany({
      where: { status: TaskStatus.OPEN },
      include: {
        company: {
          select: { companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(mapTaskResponse);
  }

  async findOne(id: string): Promise<TaskResponse> {
    const task = await this.prisma.task.findFirst({
      where: { id, status: TaskStatus.OPEN },
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
