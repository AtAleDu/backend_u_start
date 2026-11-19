import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Company, PrismaClient, User } from '@prisma/client';

type CompanyWithContact = Company & {
  user: Pick<User, 'name' | 'surname'>;
};

export const assertCompanyCanPublishTasks = async (
  prisma: PrismaClient,
  userId: string,
): Promise<CompanyWithContact> => {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, surname: true },
      },
    },
  });

  if (!company) {
    throw new NotFoundException('Профиль компании не найден');
  }

  if (
    !company.description?.trim() ||
    !company.user.name?.trim() ||
    !company.user.surname?.trim()
  ) {
    throw new BadRequestException(
      'Заполните описание компании и контактное лицо (имя и фамилия) в профиле',
    );
  }

  return company;
};
