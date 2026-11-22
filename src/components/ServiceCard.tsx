import Link from 'next/link';
import { formatMinutes, formatMoney } from '@/lib/api';
import type { Service } from '@/lib/types';

export default function ServiceCard({ service }: { service: Service }) {
  const shortDescription = service.description ? service.description.slice(0, 110) : '';

  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="h-40 overflow-hidden rounded-xl bg-neutral-200">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">✂️</div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-neutral-900">{service.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{service.category || '—'}</p>
        {shortDescription ? <p className="mt-2 text-sm text-neutral-600">{shortDescription}</p> : null}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-neutral-900">{formatMoney(service.price)}</p>
          {service.duration ? (
            <p className="text-sm text-neutral-500">{formatMinutes(service.duration)}</p>
          ) : null}
        </div>
        <Link
          href={`/services/${service._id}`}
          className="mt-3 inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
