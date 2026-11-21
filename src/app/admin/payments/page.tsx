'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatMoney, formatShortDate } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Payment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminPaymentsPage() {
  useAuthGuard('admin');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<{ payments: Payment[] }>('/api/payments')
      .then((r) => setPayments(r.payments))
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Transactions</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : !loaded ? (
        <p className="mt-6 text-neutral-500">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No payments yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Appointment date</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Status</th>
              <th className="py-3 pr-4">Stripe session</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4 font-medium text-neutral-900">
                  {p.appointment?.serviceName || `Appointment ${p._id}`}
                </td>
                <td className="py-3 pr-4 text-neutral-500">
                  {p.appointment?.appointmentDate ? formatShortDate(p.appointment.appointmentDate) : formatShortDate(p.createdAt)}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(p.amount)}</td>
                <td className="py-3 pr-4 text-right"><StatusBadge status={p.status} /></td>
                <td className="py-3 pr-4 text-xs text-neutral-500">{p.stripeCheckoutSessionId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
