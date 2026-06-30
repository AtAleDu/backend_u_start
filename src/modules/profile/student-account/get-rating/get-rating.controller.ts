import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import type { SafeUser } from '../../../../common/types/user.types';
import { GetStudentRatingService } from './get-rating.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/student/rating')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class GetStudentRatingController {
  constructor(private readonly service: GetStudentRatingService) {}

  @Get()
  @ApiOperation({ summary: 'Рейтинг студента и история начислений' })
  get(@CurrentUser() user: SafeUser) {
    return this.service.getRating(user.id);
  }
}
