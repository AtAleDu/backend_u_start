import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

export function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safeUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
  return safeUser;
}
