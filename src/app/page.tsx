import Link from 'next/link';
import Image from 'next/image';
import { CalendarCheck, CreditCard, Scissors, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Scissors, title: 'Browse', text: 'Explore our salon services — haircuts, coloring, skin care, makeup and more.' },
  { icon: CalendarCheck, title: 'Book', text: 'Request an appointment that fits your schedule and goals.' },
  { icon: CreditCard, title: 'Pay & enjoy', text: 'Confirm your appointment and get ready to look great.' },
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
  // Normalise category labels (e.g. "hair" -> "Hair") and drop case-duplicates.
  const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const categories = Array.from(
    new Map(
      services
        .map((service) => service.category?.trim())
        .filter((c): c is string => Boolean(c))
        .map((c) => [c.toLowerCase(), titleCase(c)] as const),
    ).values(),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 text-neutral-900 shadow-2xl">
        <Image
          src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1920&q=80"
          alt="Bright, modern hair salon interior"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1152px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/45 to-neutral-900/65" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-14 text-center lg:py-20">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white drop-shadow-lg">
            Book Your Next Salon Appointment
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90 drop-shadow">
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
      <div className="mt-9">
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
      <div className="mt-9">
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
      <div className="mt-9">
        <h2 className="mb-8 text-2xl font-bold text-neutral-900">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-neutral-200 p-6 text-center transition hover:border-rose-200 hover:shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-500">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
