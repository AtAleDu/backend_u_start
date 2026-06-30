import { NotFoundException } from '@nestjs/common';
import type { Company, PrismaClient } from '@prisma/client';

export const getCompanyByUserId = async (
  prisma: PrismaClient,
  userId: string,
): Promise<Company> => {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    throw new NotFoundException('Профиль компании не найден');
  }

  return company;
};
