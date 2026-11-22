import Link from 'next/link';
import { formatDateTime, formatMoney } from '@/lib/api';
import type { Payment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

/** Server component: interactive customer payment history (read-only display). */
export function CustomerPayments({ payments }: { payments: Payment[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Payment History</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {payments.length === 0 ? 'You have no payments yet.' : `${payments.length} ${payments.length === 1 ? 'transaction' : 'transactions'}`}
      </p>
      <div className="mt-4 flex justify-end">
        <Link href="/customer/dashboard" className="text-sm font-medium text-neutral-900 underline">← Back to dashboard</Link>
      </div>

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
                <td className="py-3 pr-4 text-neutral-900">{p.service || `Appointment ${p._id}`}</td>
                <td className="py-3 pr-4 text-neutral-500">
                  {formatDateTime(p.appointmentDate || p.createdAt)}
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
