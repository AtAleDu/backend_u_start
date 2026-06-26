import type { Company, User } from '@prisma/client';
import type { CompanyProfileResponse } from '../types/company-profile.types';

export const mapCompanyProfileResponse = (
  company: Company & { user: User },
): CompanyProfileResponse => ({
  companyId: company.id,
  userId: company.userId,
  companyName: company.companyName,
  description: company.description,
  name: company.user.name,
  surname: company.user.surname,
  email: company.user.email,
});
