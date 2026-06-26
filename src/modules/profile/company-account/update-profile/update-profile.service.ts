import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { mapCompanyProfileResponse } from '../lib/map-company-profile-response';
import type { CompanyProfileResponse } from '../types/company-profile.types';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Injectable()
export class UpdateCompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileResponse> {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!company) {
      throw new NotFoundException('Профиль компании не найден');
    }

    const userData: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      userData.name = dto.name;
    }

    if (dto.surname !== undefined) {
      userData.surname = dto.surname;
    }

    const companyData: Prisma.CompanyUpdateInput = {};

    if (dto.companyName !== undefined) {
      companyData.companyName = dto.companyName;
    }

    if (dto.description !== undefined) {
      companyData.description = dto.description;
    }

    const updatedCompany = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      return tx.company.update({
        where: { userId },
        data: companyData,
        include: { user: true },
      });
    });

    return mapCompanyProfileResponse(updatedCompany);
  }
}
