'use client';

import { useEffect } from 'react';
import { useToast, type ToastItem } from '@/lib/toast';

const STYLES: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200',
  error: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  info: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200',
};

/** Fixed top-right toast list. Auto-dismisses via the provider timeout. */
export function Toaster() {
  const { toasts } = useToast();

  // Reconcile: close toasts that have been replaced by newer ones is not
  // necessary — the provider already bounds the list.

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-2 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-sm rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${STYLES[t.type]}`}
        >
          <ToastContent message={t.message} />
        </div>
      ))}
    </div>
  );
}

function ToastContent({ message }: { message: string }) {
  return <span className="block">{message}</span>;
}
