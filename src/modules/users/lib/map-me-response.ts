import { Company, UserRole } from '@prisma/client';

type MeUser = {
  id: string;
  email: string;
  name: string;
  surname: string | null;
  role: UserRole;
};

export type MeResponse = MeUser & {
  companyName?: string | null;
};

export function mapMeResponse(
  user: MeUser,
  company?: Company | null,
): MeResponse {
  const response: MeResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    role: user.role,
  };

  if (user.role === UserRole.COMPANY) {
    response.companyName = company?.companyName ?? null;
  }

  return response;
}
