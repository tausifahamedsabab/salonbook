'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, formatShortDate } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Appointment, Payment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardPage() {
  useAuthGuard('customer');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ appointments: Appointment[] }>('/api/appointments'),
      api<{ payments: Payment[] }>('/api/payments'),
    ])
      .then(([a, p]) => {
        setAppointments(a.appointments);
        setPayments(p.payments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summary = [
    { label: 'Confirmed', value: String(appointments.filter((a) => a.status === 'confirmed').length), tone: '' },
    { label: 'Upcoming', value: String(appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length), tone: '' },
    { label: 'Paid', value: String(payments.filter((p) => p.status === 'paid').length), tone: '' },
    { label: 'Requests', value: String(appointments.length), tone: '' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Dashboard</h1>
      <p className="mt-1 text-neutral-500">Track your appointments and payments.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Recent appointments</h2>
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : appointments.length === 0 ? (
            <p className="text-neutral-500">You have no appointments yet. <Link href="/services" className="font-medium text-neutral-900 hover:underline">Book one now →</Link></p>
          ) : (
            <ul className="space-y-3">
              {appointments.slice(0, 5).map((a) => (
                <li key={a._id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-neutral-900">{a.service?.name || a.serviceName}</p>
                    <p className="text-sm text-neutral-500">{formatShortDate(a.appointmentDate)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Recent payments</h2>
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-neutral-500">No payments yet.</p>
          ) : (
            <ul className="space-y-3">
              {payments.slice(0, 5).map((p) => (
                <li key={p._id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-neutral-900">{p.appointment?.serviceName || `Appointment ${p._id}`}</p>
                    <p className="text-sm text-neutral-500">{formatShortDate(p.appointment?.appointmentDate || p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">
                      ${(p.amount / 100).toFixed(2)}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/customer/appointments" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50">
          View all appointments →
        </Link>
        <Link href="/customer/payments" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50">
          View all payments →
        </Link>
        <Link href="/customer/profile" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50">
          My Profile
        </Link>
      </div>
    </section>
  );
}
