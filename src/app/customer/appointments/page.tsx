'use client';

import { useEffect, useState } from 'react';
import { api, formatDateTime } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Appointment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function AppointmentsPage() {
  useAuthGuard('customer');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function load() {
    try {
      const { appointments } = await api<{ appointments: Appointment[] }>('/api/appointments');
      setAppointments(appointments);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    api<{ appointments: Appointment[] }>('/api/appointments')
      .then((r) => setAppointments(r.appointments))
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
      })
      .finally(() => setLoaded(true));
  }, []);

  async function cancel(id: string) {
    setCancellingId(id);
    setError('');
    try {
      await api(`/api/appointments/${id}/cancel`, { method: 'PUT' });
      await load();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  async function pay(id: string) {
    setError('');
    try {
      const { url } = await api<{ url: string }>(`/api/payments/checkout/${id}`, { method: 'POST' });
      window.location.assign(url);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Appointments</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loaded ? (
        <p className="mt-6 text-neutral-500">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-neutral-500">You have no appointments. Book one from the Services page.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
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
                        onClick={() => pay(a._id)}
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                      >
                        Pay now
                      </button>
                    )}
                    {a.status === 'pending' && (
                      <button
                        onClick={() => cancel(a._id)}
                        disabled={cancellingId === a._id}
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
      )}
    </section>
  );
}
