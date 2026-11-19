import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { toSafeUser } from '../../../common/types/user.types';
import { UsersService } from '../../users/users.service';
import { ACCESS_TOKEN_COOKIE } from '../auth-cookie.util';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const extractAccessTokenFromCookie = (req: Request): string | null => {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.getOrThrow<string>('app.jwt.secret');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractAccessTokenFromCookie]),
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return toSafeUser(user);
  }
}
