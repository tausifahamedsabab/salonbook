import Link from 'next/link';

/** Server component: admin pages render here if the route does not exist. */
export default function AdminNotFound() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Page not found</h1>
      <p className="mt-4 text-neutral-500">There is no admin page at this address.</p>
      <a href="/admin" className="mt-6 inline-block text-sm font-medium text-neutral-900 underline">
        Back to Admin Dashboard
      </a>
    </section>
  );
}
