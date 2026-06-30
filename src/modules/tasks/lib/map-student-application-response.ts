import type {
  ApplicationStatus,
  Company,
  Task,
  TaskApplication,
  TaskStatus,
} from '@prisma/client';

export type StudentApplicationTaskResponse = {
  id: string;
  title: string;
  companyName: string | null;
  price: number;
  deadline: string;
  status: TaskStatus;
  rating: number | null;
};

export type StudentApplicationResponse = {
  id: string;
  taskId: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  task: StudentApplicationTaskResponse;
};

type TaskApplicationWithTask = TaskApplication & {
  task: Task & {
    company: Pick<Company, 'companyName'>;
  };
};

export const mapStudentApplicationResponse = (
  application: TaskApplicationWithTask,
): StudentApplicationResponse => ({
  id: application.id,
  taskId: application.taskId,
  message: application.message,
  status: application.status,
  createdAt: application.createdAt.toISOString(),
  task: {
    id: application.task.id,
    title: application.task.title,
    companyName: application.task.company.companyName,
    price: application.task.price,
    deadline: application.task.deadline.toISOString(),
    status: application.task.status,
    rating: application.task.rating,
  },
});
