import Link from 'next/link';

/** Server component: invalid public routes render here. */
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">404 — Page not found</h1>
      <p className="text-neutral-500">This page doesn't exist or may have been removed.</p>
      <div className="flex gap-2">
        <Link href="/" className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700">
          Back to home
        </Link>
        <Link href="/services" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50">
          Browse services
        </Link>
      </div>
    </section>
  );
}
