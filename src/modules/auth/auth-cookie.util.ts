import type { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const ACCESS_TOKEN_PATH = '/api';
export const REFRESH_TOKEN_PATH = '/api/auth/refresh';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite: 'none' | 'lax' = isProd ? 'none' : 'lax';

  return {
    httpOnly: true,
    sameSite,
    secure: isProd,
  };
};

export const setAccessTokenCookie = (
  res: Response,
  accessToken: string,
): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...getCookieOptions(),
    path: ACCESS_TOKEN_PATH,
    maxAge: ACCESS_MAX_AGE_MS,
  });
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...getCookieOptions(),
    path: REFRESH_TOKEN_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
};

export const clearAccessTokenCookie = (res: Response): void => {
  const options = getCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    path: ACCESS_TOKEN_PATH,
    httpOnly: true,
    sameSite: options.sameSite,
    secure: options.secure,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const options = getCookieOptions();
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: REFRESH_TOKEN_PATH,
    httpOnly: true,
    sameSite: options.sameSite,
    secure: options.secure,
  });
};

export const clearAuthCookies = (res: Response): void => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
};

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void => {
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
};
