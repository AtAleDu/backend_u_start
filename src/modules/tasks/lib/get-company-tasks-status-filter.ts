import { TaskStatus } from '@prisma/client';
import type { CompanyTasksTabStatus } from '../dto/find-company-tasks-query.dto';

export const getCompanyTasksStatusFilter = (
  status: CompanyTasksTabStatus | undefined,
): TaskStatus[] | undefined => {
  if (status === 'active') {
    return [TaskStatus.OPEN];
  }

  if (status === 'in_progress') {
    return [TaskStatus.IN_PROGRESS];
  }

  if (status === 'completed') {
    return [TaskStatus.COMPLETED, TaskStatus.CLOSED];
  }

  return undefined;
};
