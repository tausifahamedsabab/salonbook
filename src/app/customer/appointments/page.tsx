import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { CustomerAppointments } from './CustomerAppointments';
import type { Appointment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  await requireRoleServer('customer', '/sign-in');
  const { appointments } = await serverApi<{ appointments: Appointment[] }>('/api/appointments');
  return <CustomerAppointments appointments={appointments} />;
}
