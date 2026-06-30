import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const COMPANY_TASKS_TAB_STATUSES = [
  'active',
  'in_progress',
  'completed',
] as const;

export type CompanyTasksTabStatus = (typeof COMPANY_TASKS_TAB_STATUSES)[number];

export class FindCompanyTasksQueryDto {
  @ApiPropertyOptional({ enum: COMPANY_TASKS_TAB_STATUSES })
  @IsOptional()
  @IsIn(COMPANY_TASKS_TAB_STATUSES, {
    message: 'status должен быть active, in_progress или completed',
  })
  status?: CompanyTasksTabStatus;
}
