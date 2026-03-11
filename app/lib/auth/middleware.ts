import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    username: string;
    role: string;
    cafeSlug?: string;
  };
}

export const withAuth = (
  handler: (req: AuthRequest, ...args: any[]) => Promise<NextResponse>,
  options?: { requireAdmin?: boolean; requireCafe?: boolean }
) => {
  return async (req: AuthRequest, ...args: any[]) => {
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify tokenVersion against DB to invalidate sessions after password reset
    try {
      await connectDB();
      if (user.role === 'superadmin') {
        const admin = await Admin.findById(user.id);
        if (!admin) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        if ((user as any).tokenVersion !== undefined && (user as any).tokenVersion !== (admin.tokenVersion ?? 0)) {
          return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
        }
      } else if (user.role === 'cafeadmin') {
        // Prefer Admin record if exists; otherwise fall back to Cafe
        const admin = await Admin.findById(user.id);
        if (admin) {
          if ((user as any).tokenVersion !== undefined && (user as any).tokenVersion !== (admin.tokenVersion ?? 0)) {
            return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
          }
        } else {
          const cafe = await Cafe.findOne({ username: user.username });
          if (!cafe) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
          }
          if (!cafe.isActive) {
            return NextResponse.json({ success: false, message: 'Cafe is deactivated' }, { status: 403 });
          }
          if ((user as any).tokenVersion !== undefined && (user as any).tokenVersion !== (cafe.tokenVersion ?? 0)) {
            return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
          }
        }
      }
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Authentication check failed' }, { status: 500 });
    }

    // Check role requirements
    if (options?.requireAdmin && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (options?.requireCafe && user.role !== 'cafeadmin') {
      return NextResponse.json(
        { success: false, message: 'Cafe admin access required' },
        { status: 403 }
      );
    }

    // Attach user to request
    req.user = user;

    return handler(req, ...args);
  };
};

// Middleware to check if user has access to specific cafe
export const withCafeAccess = (
  handler: (req: AuthRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthRequest, ...args: any[]) => {
    const { pathname } = req.nextUrl;
    const slug = pathname.split('/')[3]; // /api/menu/[slug]

    if (req.user?.role === 'cafeadmin' && req.user.cafeSlug !== slug) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this cafe' },
        { status: 403 }
      );
    }

    return handler(req, ...args);
  }, { requireCafe: true });
};
