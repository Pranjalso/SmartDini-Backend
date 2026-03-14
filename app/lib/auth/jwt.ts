import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (payload: JwtPayload) => {
  // Industry standard: Long-lived tokens for admin sessions as requested
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '90d' });
  
  return { token, refreshToken };
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const setTokenCookies = (token: string, refreshToken: string) => {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  cookies().set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: '/',
  });
};

export const clearTokenCookies = () => {
  cookies().delete('token');
  cookies().delete('refreshToken');
};

export const getTokenFromCookies = () => {
  const token = cookies().get('token')?.value;
  return token || null;
};