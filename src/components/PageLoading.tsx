'use client';

/** Inline spinner SVG (no extra deps) — kept for buttons and inline actions. */
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

const shimmer = 'animate-pulse rounded bg-neutral-200';

/**
 * Skeleton screen used by every loading.tsx during navigation and hard reloads.
 * Renders a lightweight placeholder of the page structure instead of a spinner.
 */
export function PageLoading({ text = 'Loading…' }: { text?: string }) {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-6 py-12"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className={`${shimmer} h-9 w-64`} />
      <div className={`${shimmer} mt-4 h-4 w-96 max-w-full`} />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className={`${shimmer} h-40 w-full rounded-xl`} />
            <div className={`${shimmer} mt-4 h-4 w-3/4`} />
            <div className={`${shimmer} mt-2 h-3 w-1/2`} />
            <div className={`${shimmer} mt-4 h-8 w-24 rounded-full`} />
          </div>
        ))}
      </div>

      <div className="sr-only">{text}</div>
    </div>
  );
}
