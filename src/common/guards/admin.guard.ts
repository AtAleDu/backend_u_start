import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { SafeUser } from '../types/user.types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: SafeUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
