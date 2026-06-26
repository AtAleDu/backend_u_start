import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { mapCompanyProfileResponse } from '../lib/map-company-profile-response';
import type { CompanyProfileResponse } from '../types/company-profile.types';

@Injectable()
export class GetCompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<CompanyProfileResponse> {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!company) {
      throw new NotFoundException('Профиль компании не найден');
    }

    return mapCompanyProfileResponse(company);
  }
}
