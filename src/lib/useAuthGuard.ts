'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import type { AppUser } from '@/lib/types';

/**
 * Client-side guard for protected areas. The proxy.ts file also guards these
 * routes server-side; this handles direct client-side navigation as a fallback.
 *
 * Roles: 'admin' → /admin area; 'customer' → /customer area; 'any' → any
 * authenticated session (e.g. service details pages).
 */
export function useAuthGuard(allowed: 'admin' | 'customer' | 'any' | null) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !allowed) return;
    const user: AppUser | null = session?.user ?? null;
    if (!user) {
      router.replace('/sign-in');
      return;
    }
    if (allowed !== 'any' && user.role !== allowed) {
      router.replace(allowed === 'admin' ? '/customer/dashboard' : '/admin');
    }
  }, [allowed, session, isPending, router]);
}

/** Convenience: the current user, or null. */
export function useCurrentUser(): AppUser | null {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return null;
  return session?.user ?? null;
}
