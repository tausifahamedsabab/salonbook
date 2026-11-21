'use client';

import { useEffect, useState } from 'react';
import { api, formatDateTime, formatMoney } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Payment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function PaymentsPage() {
  useAuthGuard('customer');
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    api<{ payments: Payment[] }>('/api/payments')
      .then(({ payments }) => setPayments(payments))
      .catch(() => {});
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Payment History</h1>

      {payments.length === 0 ? (
        <p className="mt-6 text-neutral-500">You have no payments yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4 text-neutral-900">{p.appointment?.serviceName || `Appointment ${p._id}`}</td>
                <td className="py-3 pr-4 text-neutral-500">
                  {p.appointment?.appointmentDate ? formatDateTime(p.appointment.appointmentDate) : formatDateTime(p.createdAt)}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(p.amount)}</td>
                <td className="py-3 pr-4 text-right"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
