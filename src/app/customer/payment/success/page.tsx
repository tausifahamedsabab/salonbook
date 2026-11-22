import Link from 'next/link';
import { serverApi } from '@/lib/serverApi';
import { PaymentSuccess } from './PaymentSuccess';
import type { Payment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { paymentId } = await searchParams;

  const payment = paymentId
    ? await serverApi<{ payment: Payment }>(`/api/payments/${paymentId}`)
        .then((r) => r.payment)
        .catch(() => null)
    : null;

  if (!paymentId || !payment) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Payment status</h1>
        <p className="mt-4 text-neutral-500">We couldn&#x27;t find the payment you returned from.</p>
        <Link href="/customer/dashboard" className="mt-4 inline-block text-sm font-medium text-neutral-900 underline">
          Back to your dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <PaymentSuccess payment={payment} paymentId={payment._id} />
    </section>
  );
}
