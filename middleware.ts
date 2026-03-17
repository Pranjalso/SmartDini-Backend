import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const segments = pathname.split('/').filter(Boolean);

  // Rule 1: Handle /admin and /admin/* routes
  if (segments[0] === 'admin') {
    if (!token) {
      return NextResponse.redirect(new URL('/adminlogin', req.url));
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Only superadmin can access /admin routes
      if (payload?.role === 'superadmin') {
        return NextResponse.next();
      }
      // All others are redirected
      return NextResponse.redirect(new URL('/adminlogin', req.url));
    } catch {
      // Invalid token
      return NextResponse.redirect(new URL('/adminlogin', req.url));
    }
  }

  // Rule 2: Handle /:slug/admin and /:slug/admin/* routes
  if (segments.length >= 2 && segments[1] === 'admin') {
    const slug = segments[0];
    if (!token) {
      return NextResponse.redirect(new URL(`/${slug}/adminlogin`, req.url));
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Allow superadmin OR the correct cafeadmin
      if (payload?.role === 'superadmin' || (payload?.role === 'cafeadmin' && payload?.cafeSlug === slug)) {
        return NextResponse.next();
      }
      // All others are redirected
      return NextResponse.redirect(new URL(`/${slug}/adminlogin`, req.url));
    } catch {
      // Invalid token
      return NextResponse.redirect(new URL(`/${slug}/adminlogin`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/:slug/admin', '/:slug/admin/:path*'],
};
