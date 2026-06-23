import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import type { SafeUser } from '../../../../common/types/user.types';
import { GetStudentProfileService } from './get-profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class GetStudentProfileController {
  constructor(private readonly service: GetStudentProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль студента' })
  get(@CurrentUser() user: SafeUser) {
    return this.service.getProfile(user.id);
  }
}
