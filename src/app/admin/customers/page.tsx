import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatDateTime } from '@/lib/api';
import { CustomerDetailsModal, BlockUserButton } from './AdminCustomers';
import type { AppUser } from '@/lib/types';

type Customer = AppUser & {
  _id: string;
  isBlocked?: boolean;
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
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4 text-right">Appointments</th>
                <th className="px-5 py-4 text-right">Pending</th>
                <th className="px-5 py-4 text-right">Paid</th>
                <th className="px-5 py-4 text-right">Signed up</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-neutral-200 transition-colors hover:bg-neutral-50/60 last:border-0">
                  <td className="px-5 py-4 align-middle font-medium text-neutral-900">{c.name}</td>
                  <td className="px-5 py-4 align-middle text-neutral-500">{c.email}</td>
                  <td className="px-5 py-4 text-right align-middle">{c.appointmentCount}</td>
                  <td className="px-5 py-4 text-right align-middle">{c.pendingCount}</td>
                  <td className="px-5 py-4 text-right align-middle">{c.paidCount}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right align-middle text-neutral-500">{c.createdAt ? formatDateTime(c.createdAt) : '—'}</td>
                  <td className="px-5 py-4 text-right align-middle">
                    <div className="flex justify-end gap-2">
                      <CustomerDetailsModal customer={c} />
                      <BlockUserButton customer={c} />
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
