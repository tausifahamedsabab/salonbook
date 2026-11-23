import Link from 'next/link';
import { Clock, Scissors } from 'lucide-react';
import { formatMinutes, formatMoney } from '@/lib/api';
import type { Service } from '@/lib/types';

export default function ServiceCard({ service }: { service: Service }) {
  const shortDescription = service.description ? service.description.slice(0, 110) : '';

  return (
    <div className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg">
      <div className="h-40 overflow-hidden rounded-xl bg-neutral-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-rose-50 text-rose-700">
            <Scissors className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold leading-snug text-neutral-900">{service.name}</h3>
        {shortDescription ? (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{shortDescription}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
          <p className="text-lg font-semibold text-neutral-900">{formatMoney(service.price)}</p>
          {service.duration ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
              <Clock className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              {formatMinutes(service.duration)}
            </span>
          ) : null}
        </div>

        <Link
          href={`/services/${service._id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-rose-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
