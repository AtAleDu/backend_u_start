import type { Student, User } from '@prisma/client';

export type StudentRatingResponse = {
  id: string;
  name: string;
  surname: string | null;
  rating: number;
};

type StudentWithUser = Student & {
  user: Pick<User, 'name' | 'surname'>;
};

export const mapStudentRatingResponse = (
  student: StudentWithUser,
): StudentRatingResponse => ({
  id: student.id,
  name: student.user.name,
  surname: student.user.surname,
  rating: student.ratingSum,
});
