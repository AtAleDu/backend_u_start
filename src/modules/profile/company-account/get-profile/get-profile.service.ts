import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type CompanyProfileResponse = {
  companyId: string;
  userId: string;
  name: string;
  surname: string | null;
  email: string;
};

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

    return {
      companyId: company.id,
      userId: company.userId,
      name: company.user.name,
      surname: company.user.surname,
      email: company.user.email,
    };
  }
}
