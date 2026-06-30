import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const STUDENT_APPLICATIONS_TAB_STATUSES = [
  'active',
  'in_progress',
  'rejected',
  'completed',
] as const;

export type StudentApplicationsTabStatus =
  (typeof STUDENT_APPLICATIONS_TAB_STATUSES)[number];

export class FindStudentApplicationsQueryDto {
  @ApiPropertyOptional({ enum: STUDENT_APPLICATIONS_TAB_STATUSES })
  @IsOptional()
  @IsIn(STUDENT_APPLICATIONS_TAB_STATUSES, {
    message: 'status должен быть active, in_progress, rejected или completed',
  })
  status?: StudentApplicationsTabStatus;
}
