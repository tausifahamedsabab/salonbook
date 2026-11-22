import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatDateTime } from '@/lib/api';
import type { Appointment } from '@/lib/types';
import { AppointmentDetailsModal, AppointmentActions } from './AdminAppointments';

export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRoleServer('admin', '/customer/dashboard');
  const { status } = await searchParams;
  const { appointments } = await serverApi<{ appointments: Appointment[] }>('/api/appointments' + (status ? `?status=${status}` : ''));

  const counts = STATUS_TABS.map(({ key }) => ({
    key,
    count: appointments.filter((a) => (key === 'all' ? true : a.status === key)).length,
  }));

  const activeTab = status ?? 'all';

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Appointments</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {counts.map(({ key, count }) => (
          <Link
            key={key}
            href={`/admin/appointments${key === 'all' ? '' : `?status=${key}`}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              key === activeTab
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {key[0].toUpperCase() + key.slice(1)} ({count})
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No appointments match this view.</p>
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
                <td className="py-3 pr-4">{a.customer || '—'}</td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{a.service?.name || a.serviceName}</td>
                <td className="py-3 pr-4 text-neutral-500">
                  {formatDateTime(a.appointmentDate)}
                  {a.timeSlot && <span className="text-neutral-500"> · {a.timeSlot}</span>}
                </td>
                <td className="py-3 pr-4">
                  <AppointmentActions appointment={a} />
                </td>
                <td className="py-3 pr-4 text-right">
                  <AppointmentDetailsModal appointment={a} customerName={a.customer || '—'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
