import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (payload: JwtPayload) => {
  // 🔥 Access token expires in 1 day (auto logout)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

  // 🔥 Refresh token also expires in 1 day for Super Admin and Cafe Admin as requested
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '1d' });
  
  return { token, refreshToken };
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // 🔥 This automatically checks expiry (exp)
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null; // expired or invalid token
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
  // 🔥 Access token cookie (1 day)
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // ✅ 1 day
    path: '/',
  });

  // Refresh token cookie (1 day)
  cookies().set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // ✅ 1 day
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