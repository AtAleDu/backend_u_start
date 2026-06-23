import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type StudentProfileResponse = {
  studentId: string;
  userId: string;
  name: string;
  surname: string | null;
  email: string;
};

@Injectable()
export class GetStudentProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<StudentProfileResponse> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Профиль студента не найден');
    }

    return {
      studentId: student.id,
      userId: student.userId,
      name: student.user.name,
      surname: student.user.surname,
      email: student.user.email,
    };
  }
}
