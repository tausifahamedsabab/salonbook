import Link from 'next/link';
import { api } from '@/lib/api';
import type { Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

const STEPS = [
  { icon: '✂️', title: 'Browse', text: 'Explore our salon services — haircuts, coloring, skin care, makeup and more.' },
  { icon: '🪑', title: 'Book', text: 'Request an appointment that fits your schedule and goals.' },
  { icon: '💰', title: 'Pay & enjoy', text: 'Confirm your appointment and get ready to look great.' },
];

export default async function Home() {
  let services: Service[] = [];
  try {
    const { services: all } = await api<{ services: Service[] }>('/api/services');
    services = all.filter((service) => service.status !== 'inactive');
  } catch {
    services = [];
  }

  const featured = services.slice(0, 6);
  const categories = Array.from(new Set(services.map((service) => service.category).filter((c): c is string => Boolean(c)))).sort();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-rose-50 border border-neutral-200 text-neutral-900 shadow-2xl">
        <div className="relative flex flex-col items-center justify-center px-6 py-20 text-center lg:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-neutral-900">
            Book Your Next Salon Appointment
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-600">
            Stylish haircuts, coloring, skin care, makeup and more — book your spot online in minutes.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-block rounded-full bg-white px-6 py-2.5 font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            Explore Salon Services →
          </Link>
        </div>
      </div>

      {/* Featured salon services */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Featured Salon Services</h2>
          <Link href="/services" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">No active services available yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Salon service categories */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Salon Service Categories</h2>
          <Link href="/services" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Browse all services →</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/services?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              {category}
            </Link>
          ))}
          {categories.length === 0 && <p className="text-neutral-500">No categories yet.</p>}
        </div>
      </div>

      {/* How it works (extra section) */}
      <div className="mt-12">
        <h2 className="mb-8 text-2xl font-bold text-neutral-900">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-neutral-200 p-5 text-center">
              <p className="text-4xl">{step.icon}</p>
              <h3 className="mt-3 font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
