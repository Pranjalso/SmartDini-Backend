import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // 1. Root Admin Routes (/admin, /admin/...)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/adminlogin';
      url.search = '';
      return NextResponse.redirect(url);
    }

    try {
      const part = token.split('.')[1] || '';
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
      // atob is available in Next.js middleware (Edge Runtime)
      const json = atob(base64);
      const payload = JSON.parse(json);
      const { role } = payload;

      // Superadmin can access root admin routes
      if (role === 'superadmin') {
        return NextResponse.next();
      }

      // Industry standard: If not superadmin, redirect to admin login 
      // (even if they are a cafeadmin, they need to log in as superadmin for these routes)
      const url = req.nextUrl.clone();
      url.pathname = '/adminlogin';
      url.search = '';
      return NextResponse.redirect(url);
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = '/adminlogin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // 2. Cafe Admin Routes (/:slug/admin, /:slug/admin/...)
  const cafeAdminMatch = pathname.match(/^\/([^\/]+)\/admin(\/.*)?$/);
  if (cafeAdminMatch) {
    const slug = cafeAdminMatch[1];
    
    // Always require a token for any /:slug/admin route
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}/adminlogin`;
      url.search = '';
      return NextResponse.redirect(url);
    }

    try {
      const part = token.split('.')[1] || '';
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
      // atob is available in Next.js middleware (Edge Runtime)
      const json = atob(base64);
      const payload = JSON.parse(json);
      const { role, cafeSlug } = payload;

      // Superadmin can access ANY cafe admin route
      if (role === 'superadmin') {
        return NextResponse.next();
      }

      // Cafeadmin can only access their OWN cafe admin route
      if (role === 'cafeadmin' && cafeSlug === slug) {
        return NextResponse.next();
      }

      // Otherwise, redirect to that cafe's login page
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}/adminlogin`;
      url.search = '';
      return NextResponse.redirect(url);
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}/adminlogin`;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/:slug/admin',
    '/:slug/admin/:path*',
  ],
};