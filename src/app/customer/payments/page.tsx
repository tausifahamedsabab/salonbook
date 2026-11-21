import { serverApi, requireRoleServer } from '@/lib/serverApi';
import { CustomerPayments } from './CustomerPayments';
import type { Payment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  await requireRoleServer('customer', '/sign-in');
  const { payments } = await serverApi<{ payments: Payment[] }>('/api/payments');
  return <CustomerPayments payments={payments} />;
}
