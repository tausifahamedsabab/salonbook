import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatMoney } from '@/lib/api';
import { ServiceFormModal, ServiceRowActions, type Service } from '@/app/admin/services/AdminServices';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  await requireRoleServer('admin', '/customer/dashboard');
  const { services } = await serverApi<{ services: Service[] }>('/api/services/all');

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Manage Services</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      <ServiceFormModal />

      <div className="mt-10">
        <h2 className="text-lg font-bold text-neutral-900">Services ({services.length})</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4 text-right">Price</th>
              <th className="py-3 pr-4 text-right">Duration</th>
              <th className="py-3 pr-4 text-right">Status</th>
              <th className="py-3 pr-4 text-right">Active</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id} className="border-b border-neutral-200">
                <td className="py-3 pr-4 font-medium text-neutral-900">{s.name}</td>
                <td className="py-3 pr-4 text-neutral-500">{s.category}</td>
                <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(s.price)}</td>
                <td className="py-3 pr-4 text-right text-neutral-500">{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                <td className="py-3 pr-4 text-right">{s.isActive !== false ? 'Active' : 'Inactive'}</td>
                <td className="py-3 pr-4 text-right">
                  <ServiceRowActions service={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && <p className="mt-4 text-neutral-500">No services yet.</p>}
      </div>
    </section>
  );
}
