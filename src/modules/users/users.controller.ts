import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { SafeUser } from '../../common/types/user.types';
import { mapMeResponse } from './lib/map-me-response';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  async getMe(@CurrentUser() user: SafeUser) {
    const userWithProfile = await this.usersService.findByIdWithProfile(
      user.id,
    );

    if (!userWithProfile) {
      return mapMeResponse(user);
    }

    return mapMeResponse(userWithProfile, userWithProfile.company);
  }
}
