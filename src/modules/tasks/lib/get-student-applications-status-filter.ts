import { ApplicationStatus, Prisma, TaskStatus } from '@prisma/client';
import type { StudentApplicationsTabStatus } from '../dto/find-student-applications-query.dto';

export const getStudentApplicationsWhereFilter = (
  status: StudentApplicationsTabStatus = 'active',
): Prisma.TaskApplicationWhereInput => {
  switch (status) {
    case 'in_progress':
      return {
        status: ApplicationStatus.ACCEPTED,
        task: { status: TaskStatus.IN_PROGRESS },
      };
    case 'completed':
      return {
        status: ApplicationStatus.ACCEPTED,
        task: { status: TaskStatus.COMPLETED },
      };
    case 'rejected':
      return { status: ApplicationStatus.REJECTED };
    default:
      return { status: ApplicationStatus.PENDING };
  }
};
