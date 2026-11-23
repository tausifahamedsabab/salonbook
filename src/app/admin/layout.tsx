'use client';

import { usePathname } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useSession } from '@/lib/session';
import { DashboardNav } from '@/components/DashboardNav';
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
      <DashboardNav items={items} user={user} />
      <main className="min-h-[calc(100vh-56px)] md:p-10">{children}</main>
    </div>
  );
}
