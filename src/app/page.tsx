import Link from "next/link";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";

export default async function Home() {
  let featured: Service[] = [];
  try {
    const { services } = await api<{ services: Service[] }>("/api/services");
    featured = services.slice(0, 6);
  } catch {
    featured = [];
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <div className="rounded-3xl bg-neutral-900 p-8 text-white sm:p-12">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight">
          Book your appointment at SalonBook
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-300">
          Salon services: haircuts, coloring, facials, makeup and more. Book online and relax.
        </p>
        <Link
          href="/services"
          className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 font-medium text-neutral-900 transition hover:bg-neutral-200"
        >
          Browse Services →
        </Link>
      </div>

      {/* Featured services */}
      <div className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Featured services</h2>
          <Link href="/services" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">No services available yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
