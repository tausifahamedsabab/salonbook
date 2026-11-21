'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useSession } from '@/lib/session';
import type { AppUser } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard('admin');
  const pathname = usePathname();
  const user: AppUser | null = useSession().data?.user ?? null;

  const items = [
    { href: '/admin', label: 'Dashboard', active: pathname === '/admin' },
    { href: '/admin/services', label: 'Manage Services', active: pathname.startsWith('/admin/services') },
    { href: '/admin/appointments', label: 'Manage Appointments', active: pathname.startsWith('/admin/appointments') },
    { href: '/admin/customers', label: 'Manage Users', active: pathname.startsWith('/admin/customers') },
    { href: '/admin/payments', label: 'Transactions', active: pathname.startsWith('/admin/payments') },
  ];

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      <aside className="hidden md:block">
        <nav className="sticky top-0 space-y-1 px-3 pt-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                item.active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-6 flex items-center gap-2 border-t border-neutral-200 pt-6 px-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
              {(user?.name ?? '').slice(0, 2).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-neutral-900">{user?.name}</span>
          </div>
        </nav>
      </aside>
      <main className="min-h-[calc(100vh-56px)] md:p-10">{children}</main>
    </div>
  );
}
