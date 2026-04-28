'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RitoraMark } from './icons/ritora-mark';
import { AppRoute } from '@/constants/app-routes';

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
  primaryNavLabel: string;
}

export function SiteHeaderClient({
  navLinks,
  loginLabel,
  signUpLabel,
  openMenuLabel,
  closeMenuLabel,
  primaryNavLabel,
}: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelId = 'site-header-mobile-panel';
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const search = searchParams.toString();

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, pathname, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleHashChange = () => {
      setOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [open]);

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
        <Link
          href={AppRoute.Home}
          className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground"
        >
          <RitoraMark className="h-8 w-8 text-accent-strong" />
          <span>Ritora</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={AppRoute.Login}
            className="hidden items-center justify-center rounded-full border border-border-strong bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent lg:inline-flex"
          >
            {loginLabel}
          </Link>
          <Link
            href={AppRoute.Register}
            className="hidden items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-95 lg:inline-flex"
          >
            {signUpLabel}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? closeMenuLabel : openMenuLabel}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
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
        className={`absolute inset-x-0 top-full origin-top border-b border-border bg-background/95 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 pt-4 sm:px-6">
          <nav aria-label={primaryNavLabel}>
            <ul className="flex flex-col divide-y divide-border">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={AppRoute.Register}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-base font-semibold text-background transition hover:opacity-95"
            >
              {signUpLabel}
            </Link>
            <Link
              href={AppRoute.Login}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full border border-border-strong bg-surface px-6 py-3.5 text-base font-semibold text-foreground transition hover:border-accent"
            >
              {loginLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
