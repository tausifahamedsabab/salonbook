import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatDateTime, formatMoney } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import type { Payment } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Shortened reference for the Stripe Checkout Session id (no secrets exposed). */
function shortSessionId(id?: string) {
  if (!id) return '—';
  return id.length > 18 ? `${id.slice(0, 15)}…${id.slice(-4)}` : id;
}

export default async function AdminPaymentsPage() {
  await requireRoleServer('admin', '/customer/dashboard');
  const { payments } = await serverApi<{ payments: Payment[] }>('/api/payments');

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Transactions</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      {payments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No payments yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Related service</th>
              <th className="py-3 pr-4">Appointment date</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Currency</th>
              <th className="py-3 pr-4 text-right">Status</th>
              <th className="py-3 pr-4">Stripe session</th>
              <th className="py-3 pr-4">Transaction date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4 text-neutral-900">{p.customerId?.toString?.() || '—'}</td>
                <td className="py-3 pr-4 text-neutral-900">{p.service || '—'}</td>
                <td className="py-3 pr-4 text-neutral-500">
                  {formatDateTime(p.appointmentDate || p.createdAt)}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(p.amount)}</td>
                <td className="py-3 pr-4 text-right text-neutral-500">{(p.currency || 'usd').toUpperCase()}</td>
                <td className="py-3 pr-4 text-right"><StatusBadge status={p.status} /></td>
                <td className="py-3 pr-4 text-xs text-neutral-500">{shortSessionId(p.stripeSessionId)}</td>
                <td className="py-3 pr-4 text-neutral-500">{formatDateTime(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
