import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { CustomerDashboard } from './CustomerDashboard';
import type { Appointment, Payment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireRoleServer('customer', '/sign-in');
  const [{ appointments }, { payments }] = await Promise.all([
    serverApi<{ appointments: Appointment[] }>('/api/appointments'),
    serverApi<{ payments: Payment[] }>('/api/payments'),
  ]);
  return <CustomerDashboard user={user} appointments={appointments} payments={payments} />;
}
