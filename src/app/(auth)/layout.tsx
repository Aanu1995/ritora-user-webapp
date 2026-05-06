import Link from 'next/link';
import { GuestGuard } from '@/components/auth/guest-guard';
import { RitoraMark } from '@/components/icons/ritora-mark';
import { AppRoute } from '@/constants/app-routes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,var(--color-accent-glow),transparent_60%)]"
        />
        <Link
          href={AppRoute.Home}
          className="animate-fade-in fixed top-5 left-5 z-20 inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground sm:top-6 sm:left-6"
        >
          <RitoraMark className="h-9 w-9 text-accent-strong" />
          Ritora
        </Link>
        <div className="animate-fade-up relative w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-hero sm:p-10">
          {children}
        </div>
      </div>
    </GuestGuard>
  );
}
