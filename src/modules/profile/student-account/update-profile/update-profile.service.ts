import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { mapStudentProfileResponse } from '../lib/map-student-profile-response';
import type { StudentProfileResponse } from '../types/student-profile.types';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class UpdateStudentProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateStudentProfileDto,
  ): Promise<StudentProfileResponse> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Профиль студента не найден');
    }

    const updatedStudent = await this.prisma.student.update({
      where: { userId },
      data: {
        aboutMe: dto.aboutMe,
        skills: dto.skills,
      },
      include: { user: true },
    });

    return mapStudentProfileResponse(updatedStudent);
  }
}
