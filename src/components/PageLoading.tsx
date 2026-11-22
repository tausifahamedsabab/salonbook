'use client';

/** Inline spinner SVG (no extra deps). */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-neutral-600"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M22 12a10 10 0 0 1-10 10" />
      <path d="M12 22a10 10 0 0 1-10-10" />
      <path d="M2 12a10 10 0 0 1 10-10" />
    </svg>
  );
}

/** Simple centered loading indicator used by loading.tsx files and suspense states. */
export function PageLoading({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-neutral-500" role="status" aria-live="polite">
      <Spinner />
      <span className="text-sm">{text}</span>
    </div>
  );
}
