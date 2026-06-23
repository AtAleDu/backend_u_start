import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import type { SafeUser } from '../../../../common/types/user.types';
import { GetCompanyProfileService } from './get-profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class GetCompanyProfileController {
  constructor(private readonly service: GetCompanyProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль компании' })
  get(@CurrentUser() user: SafeUser) {
    return this.service.getProfile(user.id);
  }
}
