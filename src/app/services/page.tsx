'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

type SortBy = 'priceLow' | 'priceHigh' | 'name';

export default function ServicesPage() {
  useAuthGuard(null);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('priceLow');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('sort', sortBy);
    const query = params.toString();
    api<{ services: Service[] }>(`/api/services${query ? `?${query}` : ''}`)
      .then(({ services }) => setServices(services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [search, category, sortBy]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter((c): c is string => Boolean(c)))),
    [services]
  );

  // Server-side sorting via ?sort= param; the select still re-fetches with it.
  const sorted = services;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Salon Services</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services by name..."
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
          aria-label="Sort services"
        >
          <option value="priceLow">Price (Low → High)</option>
          <option value="priceHigh">Price (High → Low)</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="text-neutral-500">No services match your search.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
