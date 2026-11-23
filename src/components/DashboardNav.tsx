'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { AppUser } from '@/lib/types';

export type DashboardNavItem = {
  href: string;
  label: string;
  active: boolean;
};

/**
 * Shared navigation for the /admin and /customer areas.
 * Desktop keeps the original sticky sidebar; small screens get a toggleable
 * menu bar so every dashboard section stays reachable on mobile.
 */
export function DashboardNav({
  items,
  user,
}: {
  items: DashboardNavItem[];
  user: AppUser | null;
}) {
  const [open, setOpen] = useState(false);

  // Also close on browser back/forward (Link clicks already call setOpen(false)).
  useEffect(() => {
    function handlePopState() {
      setOpen(false);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const linkClass = (active: boolean) =>
    `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-neutral-100 text-neutral-900'
        : 'text-neutral-600 hover:bg-neutral-50'
    }`;

  return (
    <>
      <aside className="hidden md:block">
        <nav aria-label="Dashboard" className="sticky top-0 space-y-1 px-3 pt-6">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.active)}>
              {item.label}
            </Link>
          ))}
          <div className="mt-6 flex items-center gap-2 border-t border-neutral-200 px-3 pt-6">
            <Avatar name={user?.name ?? ''} image={user?.image} size="md" />
            <span className="text-sm font-medium text-neutral-900">{user?.name}</span>
          </div>
        </nav>
      </aside>

      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="dashboard-mobile-nav"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            Menu
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={user?.name ?? ''} image={user?.image} size="sm" />
            <span className="truncate text-sm font-medium text-neutral-900">{user?.name}</span>
          </div>
        </div>
        {open && (
          <nav
            id="dashboard-mobile-nav"
            aria-label="Dashboard"
            className="space-y-1 border-b border-neutral-200 bg-white px-3 py-3"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={item.active ? 'page' : undefined}
                className={linkClass(item.active)}
              >
                {item.label}
              </Link>
            ))}
            {user?.email && (
              <p className="truncate border-t border-neutral-200 px-3 pt-3 text-xs text-neutral-500">
                {user.email}
              </p>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
