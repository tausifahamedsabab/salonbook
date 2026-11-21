'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import type { AppUser } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user: AppUser | null = session?.user ?? null;
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdminArea = pathname.startsWith('/admin');

  function closeProfile() {
    setProfileOpen(false);
  }

  async function handleLogout() {
    closeProfile();
    try {
      await authClient.signOut();
    } catch {
      // Ignore
    }
    router.push('/');
  }

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
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden sm:block">{user.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
                  <div className="border-b border-neutral-200 px-5 py-4">
                    <p className="font-semibold text-neutral-900">{user.name}</p>
                    <p className="text-sm text-neutral-500">{user.email || 'No email on file'}</p>
                    <p className="mt-1 text-xs font-medium capitalize text-neutral-600">{user.role}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/customer/dashboard'}
                      onClick={closeProfile}
                      className="block rounded-lg px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
