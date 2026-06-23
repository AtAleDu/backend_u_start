import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RefreshToken, User, UserRole } from '@prisma/client';
import { toSafeUser } from '../../common/types/user.types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Этот e-mail уже занят');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          surname: dto.surname,
          password: hashedPassword,
          role: dto.role,
        },
      });

      if (dto.role === UserRole.STUDENT) {
        await tx.student.create({ data: { userId: createdUser.id } });
      } else {
        await tx.company.create({ data: { userId: createdUser.id } });
      }

      return createdUser;
    });

    const tokens = await this.generateTokens(user);

    return {
      user: toSafeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Слишком много попыток входа. Попробуйте позже.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: toSafeUser(user),
      ...tokens,
    };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);

    // Atomic find + delete in a transaction to prevent race condition
    // where two concurrent requests with the same token both succeed.
    const stored = await this.prisma.$transaction(
      async (tx): Promise<(RefreshToken & { user: User }) | null> => {
        const token = await tx.refreshToken.findUnique({
          where: { tokenHash },
          include: { user: true },
        });

        if (!token) return null;

        await tx.refreshToken.delete({ where: { id: token.id } });
        return token;
      },
    );

    if (!stored) {
      throw new UnauthorizedException('Недействительный токен обновления');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Срок действия токена обновления истёк');
    }

    return this.generateTokens(stored.user);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  private async handleFailedLogin(
    userId: string,
    currentAttempts: number,
  ): Promise<void> {
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil: new Date(Date.now() + LOCK_TIME_MS),
        },
      });
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: newAttempts },
    });
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.resolveExpiresAt(
      this.configService.getOrThrow<string>('app.jwt.refreshExpiresIn'),
    );

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return rawToken;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveExpiresAt(duration: string): Date {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const ms: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    if (!ms[unit] || isNaN(value)) {
      throw new Error(`Invalid duration format: "${duration}"`);
    }

    return new Date(Date.now() + value * ms[unit]);
  }
}
