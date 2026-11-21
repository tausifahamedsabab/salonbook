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

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Services</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : stats.services}</p>
          <Link href="/admin/services" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">Manage Services →</Link>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Appointments</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : stats.appointments}</p>
          <Link href="/admin/appointments" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">Manage Appointments →</Link>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : stats.payments}</p>
          <Link href="/admin/payments" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">View Transactions →</Link>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Users</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : stats.customers}</p>
          <Link href="/admin/customers" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">Manage Users →</Link>
        </div>
      </div>
    </section>
  );
}
