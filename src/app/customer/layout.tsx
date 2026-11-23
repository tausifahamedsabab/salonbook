'use client';

import { usePathname } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useSession } from '@/lib/session';
import { DashboardNav } from '@/components/DashboardNav';
import type { AppUser } from '@/lib/types';

function navItemsFor(pathname: string) {
  return [
    { href: '/customer/dashboard', label: 'Dashboard', active: pathname === '/customer/dashboard' },
    { href: '/customer/appointments', label: 'My Appointments', active: pathname.startsWith('/customer/appointments') },
    { href: '/customer/payments', label: 'My Payments', active: pathname.startsWith('/customer/payments') },
    { href: '/customer/profile', label: 'My Profile', active: pathname.startsWith('/customer/profile') },
  ];
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard('customer');
  const pathname = usePathname();
  const user: AppUser | null = useSession().data?.user ?? null;
  const items = navItemsFor(pathname);

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      <DashboardNav items={items} user={user} />
      <main className="min-h-[calc(100vh-56px)] md:p-10">{children}</main>
    </div>
  );
}
