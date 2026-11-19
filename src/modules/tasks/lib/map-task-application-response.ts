import type { ApplicationStatus, TaskApplication } from '@prisma/client';

export type TaskApplicationResponse = {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  studentSurname: string | null;
  studentEmail?: string;
  studentRating: number;
  aboutMe: string | null;
  skills: string | null;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
};

type TaskApplicationWithStudent = TaskApplication & {
  student: {
    aboutMe: string | null;
    skills: string | null;
    ratingSum: number;
    ratingCount: number;
    user: {
      name: string;
      surname: string | null;
      email?: string;
    };
  };
};

export const mapTaskApplicationResponse = (
  application: TaskApplicationWithStudent,
): TaskApplicationResponse => ({
  id: application.id,
  taskId: application.taskId,
  studentId: application.studentId,
  studentName: application.student.user.name,
  studentSurname: application.student.user.surname,
  ...(application.student.user.email
    ? { studentEmail: application.student.user.email }
    : {}),
  studentRating: application.student.ratingSum,
  aboutMe: application.student.aboutMe,
  skills: application.student.skills,
  message: application.message,
  status: application.status,
  createdAt: application.createdAt.toISOString(),
});
