import { redirect } from 'next/navigation';
import type { AppUser } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Server-side fetch helper for the Express REST API. Runs only during Server
 * Components render: forwards the Better Auth session cookie from the request.
 */
export async function serverApi<T = unknown>(path: string, sessionCookie?: string): Promise<T> {
  // Default to the current request's raw Cookie header — forwarded byte-for-byte
  // (like the proxy) so the session token arrives URL-escaped as sent.
  const { headers } = await import('next/headers');
  const rawCookie = sessionCookie ?? (await headers()).get('cookie') ?? '';
  const headersToSend: Record<string, string> = rawCookie ? { cookie: rawCookie } : {};
  const res = await fetch(`${API_URL}${path}`, { headers: headersToSend, cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as { error?: string } | null)?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export type SessionUser = AppUser & { role: string; blocked?: boolean };

/** Current Better Auth session via the Express API, or null when signed out. */
export async function getServerSession(): Promise<SessionUser | null> {
  // Read the raw Cookie header and forward it byte-for-byte (like the proxy).
  const { headers } = await import('next/headers');
  const rawCookie = (await headers()).get('cookie') ?? '';
  try {
    const data = await serverApi<{ user: SessionUser }>('/api/auth/get-session', rawCookie);
    const user = data?.user;
    if (!user) return null;
    // Users without a stored role are customers (sign-up is customer-only).
    return { ...user, role: user.role || 'customer' };
  } catch {
    return null;
  }
}

/**
 * Server-side role guard for protected dashboard pages: redirects to the
 * fallback href when there is no session or the role is different.
 */
export async function requireRoleServer(role: 'admin' | 'customer', fallbackHref: string): Promise<SessionUser> {
  const user = await getServerSession();
  if (!user || user.role !== role) {
    redirect(fallbackHref);
  }
  return user;
}
