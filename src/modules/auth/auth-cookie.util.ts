import type { Response } from 'express';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';
export const REFRESH_TOKEN_PATH = '/api/auth/refresh';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite: 'none' | 'lax' = isProd ? 'none' : 'lax';

  return {
    httpOnly: true,
    sameSite,
    secure: isProd,
    path: REFRESH_TOKEN_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  };
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: REFRESH_TOKEN_PATH,
    httpOnly: true,
    sameSite: getCookieOptions().sameSite,
    secure: getCookieOptions().secure,
  });
};
