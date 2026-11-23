/* eslint-disable @next/next/no-img-element */
/** Small circular avatar: uploaded photo when available, initials otherwise. */
export function Avatar({
  name,
  image,
  size = 'sm',
}: {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md';
}) {
  const dims = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  if (image) {
    return (
      <img
        src={image}
        alt={name || 'Profile'}
        className={`${dims} shrink-0 rounded-full border border-neutral-200 object-cover`}
      />
    );
  }
  return (
    <span className={`${dims} flex shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white`}>
      {(name || '').slice(0, 2).toUpperCase()}
    </span>
  );
}
