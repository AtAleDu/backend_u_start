import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import type { SafeUser } from '../../../../common/types/user.types';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdateCompanyProfileService } from './update-profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class UpdateCompanyProfileController {
  constructor(private readonly service: UpdateCompanyProfileService) {}

  @Patch()
  @ApiOperation({ summary: 'Обновить профиль компании' })
  update(
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.service.updateProfile(user.id, dto);
  }
}
