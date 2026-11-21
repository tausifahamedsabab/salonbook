'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session-store';

export default function CustomerProfilePage() {
  const user = useSession()?.user ?? null;

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-neutral-500">Sign in to view your profile.</p>
      </section>
    );
  }

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Profile</h1>

      <div className="mt-6 flex items-center gap-6 rounded-2xl border border-neutral-200 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900">{user.name}</p>
          <p className="text-sm text-neutral-500">{user.email || 'No email on file'}</p>
          <p className="mt-1 text-sm font-medium capitalize text-neutral-600">{user.role}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/customer/appointments"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          My Appointments
        </Link>
        <Link
          href="/customer/payments"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          My Payments
        </Link>
      </div>
    </section>
  );
}
