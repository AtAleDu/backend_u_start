import { NotFoundException } from '@nestjs/common';
import type { PrismaClient, Student } from '@prisma/client';

export const getStudentByUserId = async (
  prisma: PrismaClient,
  userId: string,
): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new NotFoundException('Профиль студента не найден');
  }

  return student;
};
