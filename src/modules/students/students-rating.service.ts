import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  mapStudentRatingResponse,
  type StudentRatingResponse,
} from './lib/map-student-rating-response';

@Injectable()
export class StudentsRatingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<StudentRatingResponse[]> {
    const students = await this.prisma.student.findMany({
      include: {
        user: {
          select: { name: true, surname: true },
        },
      },
      orderBy: [{ ratingSum: 'desc' }, { createdAt: 'asc' }],
    });

    return students.map(mapStudentRatingResponse);
  }
}
