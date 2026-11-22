'use client';

import { useState } from 'react';
import { api, formatDateTime, formatMoney, formatShortDate } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { Appointment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

/** Client-only: Confirm / Cancel actions for admin appointment requests. */
export function AppointmentActions({ appointment }: { appointment: Appointment }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function action(path: string, method = 'PUT') {
    setBusy(true);
    setError('');
    try {
      await api(path, { method });
      const done = method === 'PUT' && path.endsWith('/confirm') ? 'Appointment confirmed.' : 'Appointment cancelled.';
      showToast('success', done);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setError(message);
      showToast('error', message);
    } finally {
      setBusy(false);
    }
  }

  const showCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
  return (
    <div className="flex items-center gap-2">
      {appointment.status === 'pending' && (
        <button
          onClick={() => void action(`/api/appointments/${appointment._id}/confirm`)}
          disabled={busy}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Confirm
        </button>
      )}
      {showCancel && (
        <button
          onClick={() => void action(`/api/appointments/${appointment._id}/cancel`)}
          disabled={busy}
          className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

/** Client-only: appointment details modal (admin view). */
export function AppointmentDetailsModal({ appointment, customerName }: { appointment: Appointment; customerName: string }) {
  const [open, setOpen] = useState(false);
  const paymentStatus = appointment.paymentStatus || 'unpaid';
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-neutral-500 underline hover:text-neutral-900">
        View details
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Appointment details</h3>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm text-neutral-600">
              <Row label="Customer" value={customerName} />
              <Row label="Service" value={appointment.service?.name || appointment.serviceName} />
              {appointment.service?.imageUrl && (
                <img src={appointment.service.imageUrl} alt={appointment.service.name} className="mt-2 h-16 rounded-lg object-cover" />
              )}
              <Row label="Appointment date &amp; time" value={formatDateTime(appointment.appointmentDate)} />
              {appointment.timeSlot && <Row label="Time slot" value={appointment.timeSlot} />}
              <Row label="Customer message" value={appointment.notes || '(none)'} />
              <Row label="Service price" value={appointment.service ? formatMoney(appointment.service.price) : '—'} />
              <Row label="Appointment status" value={<StatusBadge status={appointment.status} />} />
              <Row label="Payment status" value={<StatusBadge status={paymentStatus} />} />
              <Row label="Booking request date" value={appointment.requestedAt ? formatDateTime(appointment.requestedAt) : '—'} />
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
