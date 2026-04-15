'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { RitoraMark } from './icons/ritora-mark';

interface NavLink {
  href: string;
  label: string;
}

interface SiteHeaderClientProps {
  navLinks: readonly NavLink[];
  loginLabel: string;
  signUpLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
}

export function SiteHeaderClient({
  navLinks,
  loginLabel,
  signUpLabel,
  openMenuLabel,
  closeMenuLabel,
}: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = 'site-header-mobile-panel';
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Close on route/hash change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-[color:var(--color-foreground)]"
        >
          <RitoraMark className="h-8 w-8 text-[color:var(--color-accent-strong)]" />
          <span>Ritora</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[color:var(--color-muted)] lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[color:var(--color-foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-background)] transition hover:-translate-y-0.5 hover:opacity-95 sm:inline-flex"
          >
            {loginLabel}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? closeMenuLabel : openMenuLabel}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={openMenuLabel}
        className={`absolute inset-x-0 top-full origin-top border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/95 backdrop-blur-xl transition-all duration-200 lg:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 pt-4 sm:px-6">
          <nav aria-label="Primary">
            <ul className="flex flex-col divide-y divide-[color:var(--color-border)]">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-xl font-semibold tracking-tight text-[color:var(--color-foreground)] transition-colors hover:text-[color:var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-6 py-3.5 text-base font-semibold text-[color:var(--color-background)] transition hover:opacity-95"
            >
              {loginLabel}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-6 py-3.5 text-base font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)]"
            >
              {signUpLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
