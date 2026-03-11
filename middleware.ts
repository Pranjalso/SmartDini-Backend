import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
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
      const json = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString();
      const payload = JSON.parse(json);
      const role = payload?.role;
      if (role !== 'superadmin') {
        const url = req.nextUrl.clone();
        url.pathname = '/adminlogin';
        url.search = '';
        return NextResponse.redirect(url);
      }
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = '/adminlogin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }
  const match = pathname.match(/^\/([^\/]+)\/admin(\/.*)?$/);
  if (match) {
    const slug = match[1];
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}/adminlogin`;
      url.search = '';
      return NextResponse.redirect(url);
    }
    try {
      const part = token.split('.')[1] || '';
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
      const json = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString();
      const payload = JSON.parse(json);
      const role = payload?.role;
      const cafeSlug = payload?.cafeSlug;
      if (role !== 'cafeadmin' || cafeSlug !== slug) {
        const url = req.nextUrl.clone();
        url.pathname = `/${slug}/adminlogin`;
        url.search = '';
        return NextResponse.redirect(url);
      }
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
  matcher: ['/:menupages/admin/:path*', '/:menupages/admin', '/admin', '/admin/:path*'],
};
