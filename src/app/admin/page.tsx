import Link from 'next/link';
import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { formatMoney } from '@/lib/api';

type Stats = {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
};

export const dynamic = 'force-dynamic';

function StatCard({ label, value, linkLabel, href }: { label: string; value: number | string; linkLabel?: string; href?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {linkLabel && href && (
        <Link href={href} className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireRoleServer('admin', '/customer/dashboard');
  const { stats } = await serverApi<{ stats: Stats }>('/api/admin/stats');

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Registered Customers" value={stats.totalCustomers} linkLabel="Manage Users" href="/admin/customers" />
        <StatCard label="Total Active Services" value={stats.totalActiveServices} linkLabel="Manage Services" href="/admin/services" />
        <StatCard label="Total Appointment Requests" value={stats.totalAppointments} linkLabel="Manage Appointments" href="/admin/appointments" />
        <StatCard label="Pending Appointments" value={stats.pendingAppointments} />
        <StatCard label="Confirmed Appointments" value={stats.confirmedAppointments} />
        <StatCard label="Total Successful Payments" value={formatMoney(stats.totalSuccessfulPayments * 100)} />
      </div>
    </section>
  );
}
