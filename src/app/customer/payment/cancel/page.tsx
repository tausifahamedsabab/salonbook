import { serverApi, requireRoleServer } from '@/lib/serverApi';

export const dynamic = 'force-dynamic';

export default async function PaymentCancelPage() {
  await requireRoleServer('customer', '/sign-in');

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Payment cancelled</h1>
      <p className="mt-4 text-neutral-500">
        We didn't charge anything — your appointment was not confirmed. You can book a new one from your dashboard.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a
          href="/customer/dashboard"
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Back to your dashboard
        </a>
        <a href="/services" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50">
          Browse services
        </a>
      </div>
    </section>
  );
}
