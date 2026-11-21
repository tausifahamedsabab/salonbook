import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatDateTime } from '@/lib/api';
import { CustomerDetailsModal, BlockUserButton } from './AdminCustomers';
import type { AppUser } from '@/lib/types';

type Customer = AppUser & {
  _id: string;
  blocked?: boolean;
  createdAt?: string | null;
  appointmentCount: number;
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
};

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  await requireRoleServer('admin', '/customer/dashboard');
  const { customers } = await serverApi<{ customers: Customer[] }>('/api/customers');

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Manage Users</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="mt-6 text-neutral-500">No customers yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4 text-right">Appointments</th>
              <th className="py-3 pr-4 text-right">Pending</th>
              <th className="py-3 pr-4 text-right">Paid</th>
              <th className="py-3 pr-4 text-right">Signed up</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4 font-medium text-neutral-900">{c.name}</td>
                <td className="py-3 pr-4 text-neutral-500">{c.email}</td>
                <td className="py-3 pr-4 text-right">{c.appointmentCount}</td>
                <td className="py-3 pr-4 text-right">{c.pendingCount}</td>
                <td className="py-3 pr-4 text-right">{c.paidCount}</td>
                <td className="py-3 pr-4 text-right text-neutral-500">{c.createdAt ? formatDateTime(c.createdAt) : '—'}</td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    <CustomerDetailsModal customer={c} />
                    <BlockUserButton customer={c} />
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
