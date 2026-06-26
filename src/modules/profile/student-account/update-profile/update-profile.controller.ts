import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import type { SafeUser } from '../../../../common/types/user.types';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UpdateStudentProfileService } from './update-profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class UpdateStudentProfileController {
  constructor(private readonly service: UpdateStudentProfileService) {}

  @Patch()
  @ApiOperation({ summary: 'Обновить профиль студента' })
  update(@CurrentUser() user: SafeUser, @Body() dto: UpdateStudentProfileDto) {
    return this.service.updateProfile(user.id, dto);
  }
}
