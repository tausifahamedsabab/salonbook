'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatDateTime, formatShortDate } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { AppUser } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

type Customer = AppUser & {
  _id: string;
  isBlocked?: boolean;
  createdAt?: string | null;
  appointmentCount: number;
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
};

/** Client-only: block/unblock toggle for a user (Admin Users page). */
export function BlockUserButton({ customer }: { customer: Customer }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isBlocked = customer.isBlocked === true;
  async function toggle(blocked: boolean) {
    try {
      await api(`/api/customers/${customer._id}/${blocked ? 'block' : 'unblock'}`, { method: 'POST' });
      showToast('success', `${customer.name} is now ${blocked ? 'blocked' : 'unblocked'}.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Action failed.');
      return;
    }
    router.refresh();
  }
  return (
    <button
      onClick={() => void toggle(!isBlocked)}
      className={`rounded-full px-3 py-1 text-xs font-medium ${isBlocked ? 'text-emerald-700 bg-emerald-50 border border-emerald-300' : 'text-red-700 bg-red-50 border border-red-300'}`}
    >
      {isBlocked ? 'Unblock' : 'Block'}
    </button>
  );
}

/** Client-only: user details modal (Admin Users page). */
export function CustomerDetailsModal({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-neutral-500 underline hover:text-neutral-900">
        Details
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-neutral-900">User details</h3>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm text-neutral-600">
              <Row label="Name" value={customer.name} />
              <Row label="Email" value={customer.email || '—'} />
              <Row label="Role" value={<StatusBadge status={customer.role || 'customer'} />} />
              <Row label="Account status" value={customer.isBlocked ? <StatusBadge status="blocked" /> : <StatusBadge status="active" />} />
              <Row label="Booked appointments" value={`${customer.appointmentCount}`} />
              <Row label="Confirmed" value={`${customer.confirmedCount}`} />
              <Row label="Paid" value={`${customer.paidCount}`} />
              <Row label="Signed up" value={customer.createdAt ? formatDateTime(customer.createdAt) : '—'} />
              <Row label="Appointments" value={customer.appointmentCount} />
              <Row label="Pending" value={customer.pendingCount} />
              <Row label="Confirmed" value={customer.confirmedCount} />
              <Row label="Paid" value={customer.paidCount} />
            </dl>
            <button onClick={() => setOpen(false)} className="mt-6 rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{value}</dd>
    </div>
  );
}
