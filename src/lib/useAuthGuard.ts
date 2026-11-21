'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from './auth';

/**
 * Client-side guard for protected areas. The proxy.ts file also guards these
 * routes server-side; this handles direct client-side navigation as a fallback.
 */
export function useAuthGuard(allowed: 'admin' | 'customer' | null) {
  const router = useRouter();

  useEffect(() => {
    if (!allowed) return;
    const session = getSession();
    if (!session) {
      router.replace(allowed === 'admin' ? '/sign-in' : '/sign-in');
      return;
    }
    if (session.user.role !== allowed) {
      router.replace(allowed === 'admin' ? '/customer/dashboard' : '/');
    }
  }, [allowed, router]);
}
