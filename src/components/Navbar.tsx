'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { clearSession, getSession, type AppUser } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(() => getSession()?.user ?? null);

  async function handleLogout() {
    clearSession();
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    router.push('/');
  }

  const isAdminArea = pathname.startsWith('/admin');

  return (
    <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-neutral-900">
          SalonBook
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/services" className="text-neutral-600 transition hover:text-neutral-900">
            Services
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-neutral-600 transition hover:text-neutral-900">
              Admin
            </Link>
          )}
          {user && !isAdminArea && (
            <Link href="/customer/dashboard" className="text-neutral-600 transition hover:text-neutral-900">
              My Dashboard
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-neutral-700 transition hover:bg-neutral-50"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-white transition hover:bg-neutral-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
