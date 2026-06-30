import { Injectable } from '@nestjs/common';
import { ApplicationStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getStudentByUserId } from '../../../tasks/lib/get-student-by-user-id';
import type { StudentRatingDetailResponse } from '../types/student-rating.types';

@Injectable()
export class GetStudentRatingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRating(userId: string): Promise<StudentRatingDetailResponse> {
    const student = await getStudentByUserId(this.prisma, userId);

    const completedTasks = await this.prisma.task.findMany({
      where: {
        status: TaskStatus.COMPLETED,
        rating: { not: null },
        applications: {
          some: {
            studentId: student.id,
            status: ApplicationStatus.ACCEPTED,
          },
        },
      },
      include: {
        company: {
          select: { companyName: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      ratingSum: student.ratingSum,
      ratingCount: student.ratingCount,
      history: completedTasks.map((task) => ({
        taskId: task.id,
        taskTitle: task.title,
        companyName: task.company.companyName,
        rating: task.rating!,
        completedAt: task.updatedAt.toISOString(),
      })),
    };
  }
}
