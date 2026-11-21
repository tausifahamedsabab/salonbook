import Link from 'next/link';
import { formatMoney } from '@/lib/api';
import type { Service } from '@/lib/types';

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service._id}`} className="group block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 h-36 overflow-hidden rounded-xl bg-neutral-200">
        {service.imageUrl ? (
          <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">✂️</div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{service.name}</h3>
      <p className="mt-1 text-sm text-neutral-500">{service.category}</p>
      <p className="mt-3 text-lg font-semibold text-neutral-900">{formatMoney(service.price)}</p>
    </Link>
  );
}
