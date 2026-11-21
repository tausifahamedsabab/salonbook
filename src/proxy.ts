import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route guards (Next 16: proxy.ts replaces middleware.ts).
 *
 * Better Auth sessions live in cookies (`better_auth.session_token`). The
 * proxy asks the backend (GET /api/auth/get-session, passing through the
 * cookie) and guards `/admin/*` and `/customer/*` server-side.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const GUARDED_PREFIXES = ['/admin', '/customer'];

async function getSessionRole(request: NextRequest): Promise<string | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
    });
    const data = await res.json().catch(() => null);
    const user = data?.user ?? data?.session?.user;
    if (!user) return undefined;
    if (user.blocked) return 'blocked';
    // Users without a role are customers (Better Auth additionalFields default).
    return user.role || 'customer';
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isGuarded = GUARDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
  if (!isGuarded) return NextResponse.next();

  const role = await getSessionRole(request);
  if (!role) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  if (role === 'blocked') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
  }
  // A logged-in admin can't see the customer area — redirect them to the admin area.
  if ((pathname === '/customer' || pathname.startsWith('/customer/')) && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/customer', '/customer/:path*'],
};
