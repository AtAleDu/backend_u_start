import type { Company, Task, User } from '@prisma/client';

export type TaskResponse = {
  id: string;
  companyId: string;
  companyName: string | null;
  companyDescription: string | null;
  companyEmail: string | null;
  companyContactName: string | null;
  companyContactSurname: string | null;
  title: string;
  description: string;
  price: number;
  deadline: string;
  fileUrls: string[];
  status: string;
  rating: number | null;
  rejectionReason: string | null;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
};

type TaskWithCompany = Task & {
  company: Pick<Company, 'companyName' | 'description'> & {
    user: Pick<User, 'email' | 'name' | 'surname'>;
  };
  _count?: {
    applications: number;
  };
};

export const mapTaskResponse = (task: TaskWithCompany): TaskResponse => ({
  id: task.id,
  companyId: task.companyId,
  companyName: task.company.companyName,
  companyDescription: task.company.description,
  companyEmail: task.company.user.email,
  companyContactName: task.company.user.name,
  companyContactSurname: task.company.user.surname,
  title: task.title,
  description: task.description,
  price: task.price,
  deadline: task.deadline.toISOString(),
  fileUrls: task.fileUrls,
  status: task.status,
  rating: task.rating,
  rejectionReason: task.rejectionReason,
  ...(task._count ? { applicationsCount: task._count.applications } : {}),
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
