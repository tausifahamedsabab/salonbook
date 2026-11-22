'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatMoney } from '@/lib/api';
import { useSession } from '@/lib/session';
import { TIME_SLOTS } from '@/lib/slots';
import { Spinner } from '@/components/PageLoading';
import { useToast } from '@/lib/toast';
import type { AppUser } from '@/lib/types';

/** Booking form on the service details page: date, time slot, message. */
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
  const { showToast } = useToast();
  const { data } = useSession();
  const user = data?.user ?? null;
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (user?.role === 'admin') {
      setError('Customer appointment requests are not available for admins.');
      showToast('error', 'Customer appointment requests are not available for admins.');
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
        body: JSON.stringify({ serviceId, appointmentDate: `${appointmentDate}T${timeSlot}`, timeSlot, notes }),
      });
      showToast('success', `Appointment request sent for ${serviceName}!`);
      setAppointmentDate('');
      setNotes('');
      router.push('/customer/appointments');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit your appointment request.';
      setError(message);
      showToast('error', message);
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

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-neutral-200 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-date" className="block text-sm font-medium text-neutral-700">Appointment date</label>
          <input
            id="appointment-date"
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="appointment-slot" className="block text-sm font-medium text-neutral-700">Available time slot</label>
          <select
            id="appointment-slot"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="appointment-notes" className="block text-sm font-medium text-neutral-700">Additional message (optional)</label>
        <textarea
          id="appointment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Anything to share about ${serviceName}?`}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading && <Spinner size={16} />}
        {loading ? 'Submitting…' : `Request appointment — ${formatMoney(price)}`}
      </button>
    </form>
  );
}
