'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatMoney } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { AppUser } from '@/lib/types';

export default function AppointmentRequestForm({
  serviceId,
  serviceName,
  price,
}: {
  serviceId: string;
  serviceName: string;
  price: number;
}) {
  const router = useRouter();
  const user = useSession().data?.user as AppUser | null;
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (user?.role !== 'customer') {
      setError('Customer appointment requests are not available for admins.');
      return;
    }
    if (!appointmentDate) {
      setError('Please pick an appointment date.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({ serviceId, appointmentDate, notes }),
      });
      setAppointmentDate('');
      setNotes('');
      router.push('/customer/appointments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your appointment request.');
    } finally {
      setLoading(false);
    }
  }

  if (user === null) {
    return (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
        Please sign in with your customer account to request an appointment.
      </div>
    );
  }
  if (user.role !== 'customer') {
    return (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
        Customer appointment requests are not available for admins.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-neutral-200 p-5">
      <div>
        <label htmlFor="appointment-date" className="block text-sm font-medium text-neutral-700">
          Appointment date &amp; time
        </label>
        <input
          id="appointment-date"
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="appointment-notes" className="block text-sm font-medium text-neutral-700">
          Notes (optional)
        </label>
        <textarea
          id="appointment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Style preferences for ${serviceName}`}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? 'Submitting…' : `Request appointment — ${formatMoney(price)}`}
      </button>
    </form>
  );
}
