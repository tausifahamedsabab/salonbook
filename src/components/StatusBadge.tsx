const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-zinc-100 text-zinc-600',
  blocked: 'bg-red-100 text-red-700',
  active: 'bg-emerald-100 text-emerald-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STATUS_CLASSES[status] || 'bg-zinc-100 text-zinc-700'
      }`}
    >
      {status}
    </span>
  );
}
