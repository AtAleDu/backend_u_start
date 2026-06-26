import type { Student, User } from '@prisma/client';
import type { StudentProfileResponse } from '../types/student-profile.types';

export const mapStudentProfileResponse = (
  student: Student & { user: User },
): StudentProfileResponse => ({
  studentId: student.id,
  userId: student.userId,
  aboutMe: student.aboutMe,
  skills: student.skills,
  name: student.user.name,
  surname: student.user.surname,
  email: student.user.email,
});
