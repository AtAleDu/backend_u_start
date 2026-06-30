import type { Company, Task } from '@prisma/client';

export type TaskResponse = {
  id: string;
  companyId: string;
  companyName: string | null;
  title: string;
  description: string;
  price: number;
  deadline: string;
  fileUrls: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

type TaskWithCompany = Task & {
  company: Pick<Company, 'companyName'>;
};

export const mapTaskResponse = (task: TaskWithCompany): TaskResponse => ({
  id: task.id,
  companyId: task.companyId,
  companyName: task.company.companyName,
  title: task.title,
  description: task.description,
  price: task.price,
  deadline: task.deadline.toISOString(),
  fileUrls: task.fileUrls,
  status: task.status,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
