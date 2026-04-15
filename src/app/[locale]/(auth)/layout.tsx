import { getTranslations } from 'next-intl/server';
import { GuestGuard } from '@/components/auth/guest-guard';
import { RitoraMark } from '@/components/icons/ritora-mark';
import { Link } from '@/i18n/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('auth');

  return (
    <GuestGuard>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,var(--color-accent-glow),transparent_60%)]"
        />
        <div className="relative mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-[color:var(--color-foreground)]"
          >
            <RitoraMark className="h-9 w-9 text-[color:var(--color-accent-strong)]" />
            Ritora
          </Link>
        </div>
        <div className="relative w-full max-w-xl rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-[var(--shadow-hero)] sm:p-10">
          {children}
        </div>
        <Link
          href="/"
          className="relative mt-6 text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
        >
          {t('backToHome')}
        </Link>
      </div>
    </GuestGuard>
  );
}
