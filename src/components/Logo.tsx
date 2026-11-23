import Link from 'next/link';

/** Shared brand mark: the crimson "S" tile plus the SalonBook wordmark. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="SalonBook home">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-700 text-lg font-bold leading-none text-white shadow-sm"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        S
      </span>
      <span className="text-2xl font-bold tracking-tight text-neutral-900">SalonBook</span>
    </Link>
  );
}
