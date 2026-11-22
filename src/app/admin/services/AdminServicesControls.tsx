'use client';

import { useMemo, useState } from 'react';
import { formatMoney } from '@/lib/api';
import { ServiceRowActions, type Service } from '@/app/admin/services/AdminServices';

type SortKey = 'priceLow' | 'priceHigh' | 'name';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'priceLow', label: 'Price (Low → High)' },
  { value: 'priceHigh', label: 'Price (High → Low)' },
  { value: 'name', label: 'Name (A–Z)' },
];

/** Client-only: search-by-name + price-sort controls above the services table (Admin Services page). */
export function AdminServicesControls({ services: initial }: { services: Service[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('priceLow');

  const services = useMemo(() => {
    const list = initial.filter((s) => (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true));
    const sorted = [...list];
    if (sort === 'priceHigh') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }, [initial, search, sort]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services by name..."
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort services"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
            <th className="py-3 pr-4">Name</th>
            <th className="py-3 pr-4">Category</th>
            <th className="py-3 pr-4 text-right">Price</th>
            <th className="py-3 pr-4 text-right">Duration</th>
            <th className="py-3 pr-4 text-right">Status</th>
            <th className="py-3 pr-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s._id} className="border-b border-neutral-200">
              <td className="py-3 pr-4 font-medium text-neutral-900">{s.name}</td>
              <td className="py-3 pr-4 text-neutral-500">{s.category}</td>
              <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(s.price)}</td>
              <td className="py-3 pr-4 text-right text-neutral-500">{s.duration ? `${s.duration} min` : '—'}</td>
              <td className="py-3 pr-4 text-right">{s.status !== 'inactive' ? 'Active' : 'Inactive'}</td>
              <td className="py-3 pr-4 text-right">
                <ServiceRowActions service={s} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {services.length === 0 && <p className="mt-4 text-neutral-500">No services match.</p>}
    </div>
  );
}
