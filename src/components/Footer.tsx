export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <p className="text-sm font-semibold tracking-wide text-neutral-500">SalonBook</p>
        <p className="text-sm text-neutral-500">Book your hair, beauty and spa appointments online.</p>
        <p className="text-sm text-neutral-400">&copy; {new Date().getFullYear()} SalonBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
