import Link from 'next/link';
import { api, formatMinutes, formatMoney } from '@/lib/api';
import type { Service } from '@/lib/types';
import AppointmentRequestForm from './AppointmentRequestForm';
import RequireAuthentication from '@/components/RequireAuthentication';

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { service } = await api<{ service: Service }>(`/api/services/${id}`).catch(() => ({
    service: null as Service | null,
  }));

  if (!service) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <RequireAuthentication />
        <p className="text-neutral-500">Service not found.</p>
        <Link href="/services" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Back to services
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <RequireAuthentication />
      <Link href="/services" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
        ← Back to services
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 p-6">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full rounded-xl object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-neutral-100 text-5xl">✂️</div>
          )}
          <h1 className="mt-4 text-3xl font-bold text-neutral-900">{service.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{service.category}</p>
          <p className="mt-3 text-lg font-semibold text-neutral-900">{formatMoney(service.price)}</p>
          {service.duration ? (
            <p className="mt-2 text-sm text-neutral-500">{formatMinutes(service.duration)}</p>
          ) : null}
          <p className="mt-3 text-sm text-neutral-600">{service.description}</p>
          {service.status !== 'active' ? (
            <p className="mt-3 text-sm text-amber-600">This service is currently inactive.</p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-900">Request an appointment</h2>
          <AppointmentRequestForm
            serviceId={service._id}
            serviceName={service.name}
            price={service.price}
          />
        </div>
      </div>
    </section>
  );
}
