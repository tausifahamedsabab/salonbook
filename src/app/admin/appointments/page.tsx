import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatDateTime } from '@/lib/api';
import type { Appointment } from '@/lib/types';
import { AppointmentDetailsModal, AppointmentActions } from './AdminAppointments';

export const dynamic = 'force-dynamic';

export default async function AdminAppointmentsPage() {
  await requireRoleServer('admin', '/customer/dashboard');
  const [{ appointments }, { customers }] = await Promise.all([
    serverApi<{ appointments: Appointment[] }>('/api/appointments'),
    serverApi<{ customers: Array<{ _id: string; name: string; email?: string }> }>('/api/customers'),
  ]);
  const names = new Map(customers.map((c) => [c._id, c.name || c.email || 'Customer']));

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Appointments</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      {appointments.length === 0 ? (
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
                <td className="py-3 pr-4">{names.get(a.customerId || a.customer || '') || (a.customerId || a.customer)}</td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{a.service?.name || a.serviceName}</td>
                <td className="py-3 pr-4 text-neutral-500">{formatDateTime(a.appointmentDate)}</td>
                <td className="py-3 pr-4">
                  <AppointmentActions appointment={a} />
                </td>
                <td className="py-3 pr-4 text-right">
                  <AppointmentDetailsModal appointment={a} customerName={names.get(a.customerId || a.customer || '') || (a.customerId || a.customer || '—')} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
