import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '@/types';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (typeof JWT_SECRET !== 'string' || typeof JWT_REFRESH_SECRET !== 'string') {
  throw new Error('JWT secrets are not defined in the environment variables');
}

export const generateTokens = (payload: JwtPayload) => {
  // Access token expires in 1 day (configurable)
  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1d') as SignOptions['expiresIn'] 
  });

  // Refresh token expires in 1 day (configurable)
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '1d') as SignOptions['expiresIn'] 
  });
  
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
  // Access token cookie (1 day)
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  // Refresh token cookie (1 day)
  cookies().set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
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