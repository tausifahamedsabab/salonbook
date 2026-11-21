import Link from 'next/link';

function FooterLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`text-sm text-neutral-500 transition hover:text-neutral-900 ${className}`}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and short description */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tight text-neutral-900">
              SalonBook
            </Link>
            <p className="text-sm leading-6 text-neutral-500">
              Book your hair, beauty and spa appointments online. Discover your next look.
            </p>
          </div>

          {/* Important navigation links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Explore</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href="/">Home</FooterLink>
              </li>
              <li>
                <FooterLink href="/services">Salon Services</FooterLink>
              </li>
              <li>
                <FooterLink href="/sign-in">Sign In</FooterLink>
              </li>
              <li>
                <FooterLink href="/sign-up">Sign Up</FooterLink>
              </li>
              <li>
                <FooterLink href="/admin">Admin Dashboard</FooterLink>
              </li>
            </ul>
          </nav>

          {/* Salon contact information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="text-neutral-500">
                Phone: <span className="text-neutral-700">+1 (555) 123-4567</span>
              </li>
              <li className="text-neutral-500">
                Email: <span className="text-neutral-700">appointments@salonbook.com</span>
              </li>
            </ul>
          </div>

          {/* Salon address and opening hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Location &amp; Hours</h3>
            <p className="mt-4 text-sm text-neutral-500">
              123 Main Street, Salon Hill
              <br />
              City, State 12345
            </p>
            <dl className="mt-4">
              <dt className="text-sm font-medium text-neutral-700">Opening Hours</dt>
              <dd className="mt-1 space-y-1 text-sm text-neutral-500">
                <span className="block">Mon – Fri: 9:00 AM – 6:00 PM</span>
                <span className="block">Sat: 10:00 AM – 4:00 PM</span>
                <span className="block">Sun: Closed</span>
              </dd>
            </dl>
          </div>
        </div>

        {/* Social media links and copyright */}
        <div className="mt-10 flex flex-col gap-6 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Follow us</span>
            <div className="flex items-center gap-3">
              {(
                [
                  { href: 'https://facebook.com/salonbook', label: 'Facebook' },
                  { href: 'https://instagram.com/salonbook', label: 'Instagram' },
                  { href: 'https://twitter.com/salonbook', label: 'Twitter' },
                  { href: 'https://linkedin.com/company/salonbook', label: 'LinkedIn' },
                ] as const
              ).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            &copy; {year} SalonBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
