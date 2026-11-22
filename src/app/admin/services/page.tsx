import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { ServiceFormModal, type Service } from '@/app/admin/services/AdminServices';
import { AdminServicesControls } from '@/app/admin/services/AdminServicesControls';

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
        <AdminServicesControls services={services} />
      </div>
    </section>
  );
}
