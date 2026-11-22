'use client';

import { useEffect, useState } from 'react';
import { api, formatMoney, formatShortDate } from '@/lib/api';
import { PageLoading, Spinner } from '@/components/PageLoading';
import { useToast } from '@/lib/toast';
import type { Payment } from '@/lib/types';

interface VerifyResponse {
  success: boolean;
  paid: boolean;
  payment?: Payment;
}

/** Client-only: polls Stripe verification; shows confirmation or retry path. */
export function PaymentSuccess({ payment, paymentId }: { payment: Payment; paymentId: string }) {
  const { showToast } = useToast();
  const [paid, setPaid] = useState(payment.status === 'paid');
  const [current, setCurrent] = useState(payment);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(!paid);

  useEffect(() => {
    if (paid) return;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const res = await api<VerifyResponse>(`/api/payments/${paymentId}/verify`);
        if (res.paid) {
          setPaid(true);
          showToast('success', 'Your payment was confirmed! Your appointment is now confirmed.');
        } else if (res.payment) {
          setCurrent(res.payment);
        }
      } catch {
        setError('We could not check the payment status right now. Check your dashboard.');
        setChecking(false);
        clearInterval(timer);
      }
      if (attempts >= 8) { setChecking(false); clearInterval(timer); }
    }, 2500);
    return () => clearInterval(timer);
  }, [paymentId, paid, showToast]);

  if (paid) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-emerald-800">Payment confirmed!</h1>
        <p className="mt-3 text-emerald-700">Thank you — your appointment is now confirmed.</p>
        {current.receiptUrl && (
          <a
            href={current.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-neutral-900 underline"
          >
            View your receipt
          </a>
        )}
        <dl className="mt-5 text-left text-sm text-neutral-700">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Service</dt>
            <dd>{current.service || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Appointment date</dt>
            <dd>{current.appointmentDate ? formatShortDate(current.appointmentDate) : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Amount paid</dt>
            <dd className="font-semibold">{formatMoney(current.amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Status</dt>
            <dd className="capitalize">{current.status}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <a href="/customer/dashboard" className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700">
            Back to dashboard
          </a>
          <a href="/services" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50">
            Book another service
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
      {checking ? (
        <PageLoading text="Verifying your payment…" />
      ) : (
        <>
          <Spinner size={24} />
          <h2 className="mt-4 text-xl font-bold text-neutral-900">Still waiting…</h2>
          <p className="mt-2 text-sm text-neutral-500">Your appointment payment is completing in Stripe.</p>
          {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}
          <a href="/customer/dashboard" className="mt-5 inline-block text-sm font-medium text-neutral-900 underline">
            Check your dashboard instead
          </a>
        </>
      )}
    </div>
  );
}
