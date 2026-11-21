'use client';

import { useEffect, useState } from 'react';
import { api, formatDateTime, formatMoney, formatShortDate } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useSession } from '@/lib/session';
import { StatusBadge } from '@/components/StatusBadge';
import type { Appointment, Payment } from '@/lib/types';

export default function DashboardPage() {
  useAuthGuard('customer');
  const user = useSession().data?.user ?? null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<{ appointments: Appointment[] }>('/api/appointments'),
      api<{ payments: Payment[] }>('/api/payments'),
    ])
      .then(([a, p]) => {
        setAppointments(a.appointments);
        setPayments(p.payments);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load your appointments'))
      .finally(() => setLoading(false));
  }, []);

  const paymentByAppointment = new Map(payments.map((p) => [p.appointmentId, p]));
  const summary = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  async function cancel(id: string) {
    setCancellingId(id);
    setError('');
    try {
      await api(`/api/appointments/${id}/cancel`, { method: 'PUT' });
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' as const } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel this appointment.');
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
      setError(err instanceof Error ? err.message : 'Could not start payment.');
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Hello, {user?.name || 'there'}
          </h1>
          <p className="text-sm text-neutral-500">Track your appointments and payments.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Total Appointment Requests</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : summary.total}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : summary.confirmed}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-500">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{loading ? '…' : summary.cancelled}</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-10">
        <h2 className="text-xl font-bold text-neutral-900">My Appointments</h2>
        {loading ? (
          <p className="mt-4 text-neutral-500">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="mt-4 text-neutral-500">You have no appointments yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {appointments.map((a) => {
              const payment = paymentByAppointment.get(a._id);
              return (
                <div key={a._id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900">{a.service?.name || a.serviceName}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {a.service?.category ? `${a.service.category} · ` : ''}
                        {formatDateTime(a.appointmentDate)}
                      </p>
                      {a.notes && <p className="mt-1 text-sm text-neutral-600">Notes: {a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={a.status} />
                      <StatusBadge status={payment ? payment.status : 'pending'} />
                      <button
                        type="button"
                        onClick={() => setExpandedId((open) => (open === a._id ? null : a._id))}
                        className="text-xs font-medium text-neutral-500 underline hover:text-neutral-900"
                      >
                        {expandedId === a._id ? 'Hide details' : 'View details'}
                      </button>
                    </div>
                  </div>
                  {a.service?.imageUrl && (
                    <img src={a.service.imageUrl} alt={a.service.name} className="mt-3 h-12 rounded-lg object-cover" />
                  )}
                  {expandedId === a._id && (
                    <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Appointment date</dt>
                        <dd className="text-neutral-900">{formatDateTime(a.appointmentDate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Service price</dt>
                        <dd className="text-neutral-900">{a.service ? formatMoney(a.service.price) : '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Requested</dt>
                        <dd className="text-neutral-900">{formatShortDate(a.requestedAt)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Payment status</dt>
                        <dd className="text-neutral-900">{payment ? payment.status : 'Not paid yet'}</dd>
                      </div>
                    </dl>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    {a.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => cancel(a._id)}
                        disabled={cancellingId === a._id}
                        className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => pay(a._id)}
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                      >
                        Pay now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
