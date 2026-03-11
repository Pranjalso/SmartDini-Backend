import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Protected routes
const protectedRoutes = [
  '/api/cafes',
  '/api/menu',
  '/api/orders',
  '/api/upload',
];

// Admin only routes
const adminRoutes = [
  '/api/cafes',
];

// Public routes (no auth required)
const publicRoutes = [
  '/api/auth/admin/login',
  '/api/auth/cafe/login',
  '/api/auth/refresh',
  '/api/menu/', // Menu is public
  '/api/orders/', // Creating orders is public
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect page routes as well
  const isAdminPage = pathname === '/admin';
  const isCafeAdminPage = /^\/[^/]+\/admin$/.test(pathname);

  if (isAdminPage || isCafeAdminPage) {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      const loginUrl = isAdminPage
        ? new URL('/adminlogin', request.url)
        : new URL(`/${pathname.split('/')[1]}/adminlogin`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    const user = verifyToken(token);
    if (!user) {
      const loginUrl = isAdminPage
        ? new URL('/adminlogin', request.url)
        : new URL(`/${pathname.split('/')[1]}/adminlogin`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdminPage && user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/adminlogin', request.url));
    }
    if (isCafeAdminPage) {
      const slug = pathname.split('/')[1];
      if (!(user.role === 'cafeadmin' && user.cafeSlug === slug) && user.role !== 'superadmin') {
        return NextResponse.redirect(new URL(`/${slug}/adminlogin`, request.url));
      }
    }
  }

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token = request.cookies.get('token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

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

  // Check admin routes, but allow cafe self routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Allow cafe admins to access /api/cafes/:slug/self
    const cafeSelfMatch = pathname.match(/^\/api\/cafes\/([^/]+)\/self/);
    if (cafeSelfMatch) {
      const slug = cafeSelfMatch[1];
      if (user.role === 'cafeadmin' && user.cafeSlug === slug) {
        // allowed
      } else if (user.role !== 'superadmin') {
        return NextResponse.json(
          { success: false, message: 'Access denied' },
          { status: 403 }
        );
      }
    } else {
      if (user.role !== 'superadmin') {
        return NextResponse.json(
          { success: false, message: 'Admin access required' },
          { status: 403 }
        );
      }
    }
  }

  // Check cafe access for menu operations
  if (pathname.startsWith('/api/menu/')) {
    const slug = pathname.split('/')[3];
    if (user.role === 'cafeadmin' && user.cafeSlug !== slug) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin',
    '/admin/:path*',
    '/:slug/admin',
  ],
};
