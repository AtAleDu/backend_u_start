import type { Student, User } from '@prisma/client';

export type StudentRatingResponse = {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  rating: number;
};

type StudentWithUser = Student & {
  user: Pick<User, 'name' | 'surname' | 'email'>;
};

export const mapStudentRatingResponse = (
  student: StudentWithUser,
): StudentRatingResponse => ({
  id: student.id,
  name: student.user.name,
  surname: student.user.surname,
  email: student.user.email,
  rating: student.ratingSum,
});
