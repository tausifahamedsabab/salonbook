'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';

export default function AdminDashboardPage() {
  useAuthGuard('admin');
  const [stats, setStats] = useState({ services: 0, appointments: 0, payments: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ services: unknown[] }>('/api/services'),
      api<{ appointments: unknown[] }>('/api/appointments'),
      api<{ payments: unknown[] }>('/api/payments'),
      api<{ customers: unknown[] }>('/api/customers'),
    ])
      .then(([services, appointments, payments, customers]) => {
        setStats({
          services: services.services.length,
          appointments: appointments.appointments.length,
          payments: payments.payments.length,
          customers: customers.customers.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Services', value: stats.services, href: '/admin/services' },
    { label: 'Appointments', value: stats.appointments, href: '/admin/appointments' },
    { label: 'Payments', value: stats.payments, href: '/admin/payments' },
    { label: 'Customers', value: stats.customers, href: '/admin/customers' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : c.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
