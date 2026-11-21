import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route guards (Next 16: proxy.ts replaces middleware.ts).
 *
 * The frontend mirrors the session as a `salonbook_user` cookie after login,
 * so protected areas can be checked before rendering.
 */

const GUARDED_PREFIXES = ['/admin', '/customer'];
const COOKIE_NAME = 'salonbook_user';

function readCookie(request: NextRequest, name: string): string | undefined {
  const value = request.cookies.get(name)?.value;
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseRole(cookieValue: string | undefined): string | undefined {
  if (!cookieValue) return undefined;
  try {
    const parsed = JSON.parse(cookieValue);
    return typeof parsed?.role === 'string' ? parsed.role : undefined;
  } catch {
    return undefined;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isGuarded = GUARDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
  if (!isGuarded) return NextResponse.next();

  const role = parseRole(readCookie(request, COOKIE_NAME));
  if (!role) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/customer', '/customer/:path*'],
};
