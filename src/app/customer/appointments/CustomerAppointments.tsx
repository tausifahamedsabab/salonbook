'use client';

import { useState } from 'react';
import { api, formatDateTime } from '@/lib/api';
import { Spinner } from '@/components/PageLoading';
import { useToast } from '@/lib/toast';
import type { Appointment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

/** Client-only: interactive customer appointment list (Pay, Cancel). */
export function CustomerAppointments({ appointments: initial }: { appointments: Appointment[] }) {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState(initial);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function action(id: string, path: string) {
    setBusyId(id);
    setError('');
    try {
      await api(path, { method: 'PUT' });
      showToast('success', 'Appointment cancelled.');
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' as const } : a)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setError(message);
      showToast('error', message);
    } finally {
      setBusyId(null);
    }
  }

  async function pay(id: string) {
    setBusyId(id);
    setError('');
    try {
      const { url } = await api<{ url: string }>(`/api/payments/checkout/${id}`, { method: 'POST' });
      showToast('info', 'Redirecting to Stripe…');
      window.location.assign(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start payment.';
      setError(message);
      showToast('error', message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Appointments</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {appointments.length === 0 ? (
        <p className="mt-6 text-neutral-500">You have no appointments. Book one from the Services page.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-3 pr-4">Service</th>
                <th className="py-3 pr-4">Date &amp; time</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-neutral-200">
                  <td className="py-3 pr-4 font-medium text-neutral-900">{a.service?.name || a.serviceName}</td>
                  <td className="py-3 pr-4 text-neutral-500">{formatDateTime(a.appointmentDate)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      {a.status === 'confirmed' && (
                        <button
                          onClick={() => void pay(a._id)}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                        >
                          Pay now
                        </button>
                      )}
                      {a.status === 'pending' && (
                        <button
                          onClick={() => void action(a._id, `/api/appointments/${a._id}/cancel`)}
                          disabled={busyId === a._id}
                          className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
