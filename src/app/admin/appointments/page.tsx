'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatDateTime } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Appointment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminAppointmentsPage() {
  useAuthGuard('admin');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const { appointments } = await api<{ appointments: Appointment[] }>('/api/appointments');
    setAppointments(appointments);
  }

  useEffect(() => {
    api<{ appointments: Appointment[] }>('/api/appointments')
      .then((r) => setAppointments(r.appointments))
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
      })
      .finally(() => setLoaded(true));
  }, []);

  async function confirm(id: string) {
    setError('');
    try {
      await api(`/api/appointments/${id}/confirm`, { method: 'PUT' });
      await load();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }

  async function cancel(id: string) {
    setError('');
    try {
      await api(`/api/appointments/${id}/cancel`, { method: 'PUT' });
      await load();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Appointments</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : !loaded ? (
        <p className="mt-6 text-neutral-500">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No appointments yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Date &amp; time</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4">{a.customer?.name || a.customerId}</td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{a.service?.name || a.serviceName}</td>
                <td className="py-3 pr-4 text-neutral-500">{formatDateTime(a.appointmentDate)}</td>
                <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button
                          onClick={() => confirm(a._id)}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => cancel(a._id)}
                          className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => cancel(a._id)}
                        className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
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
