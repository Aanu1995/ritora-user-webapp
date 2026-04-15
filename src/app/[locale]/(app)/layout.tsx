import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Link } from '@/i18n/navigation';
import { RitoraMark } from '@/components/icons/ritora-mark';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('nav');

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-[color:var(--color-foreground)]"
            >
              <RitoraMark className="h-8 w-8 text-[color:var(--color-accent-strong)]" />
              Ritora
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-[color:var(--color-muted)] lg:flex">
              <Link
                href="/dashboard"
                className="transition hover:text-[color:var(--color-foreground)]"
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/skin-profile"
                className="transition hover:text-[color:var(--color-foreground)]"
              >
                {t('skinProfile')}
              </Link>
            </nav>

          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
