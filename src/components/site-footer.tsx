import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site';
import type { Locale } from '@/i18n/config';

const localeLabels: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
};

export async function SiteFooter() {
  const [tNav, tFooter, tAuth] = await Promise.all([
    getTranslations('nav'),
    getTranslations('footer'),
    getTranslations('auth'),
  ]);
  const activeLocale = (await getLocale()) as Locale;

  const navLinks = siteConfig.nav.map((item) => ({
    href: item.href,
    label: tNav(item.labelKey),
  }));

  const languageLinks: ReadonlyArray<{ locale: Locale; label: string }> = [
    { locale: 'en', label: localeLabels.en },
    { locale: 'sv', label: localeLabels.sv },
  ];

  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[color:var(--color-accent)]">
            {siteConfig.name}
          </p>
          <p className="max-w-md text-sm leading-7 text-[color:var(--color-muted)]">
            {tFooter('brandBlurb')}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
            {tFooter('columns.explore')}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--color-muted)]">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[color:var(--color-foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
            {tFooter('columns.legal')}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--color-muted)]">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[color:var(--color-foreground)]"
            >
              {tAuth('privacyPolicy')}
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[color:var(--color-foreground)]"
            >
              {tAuth('termsOfService')}
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-[color:var(--color-foreground)]"
            >
              Cookie Notice
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
            {tFooter('columns.language')}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--color-muted)]">
            {languageLinks.map((item) => {
              const isActive = item.locale === activeLocale;
              return (
                <Link
                  key={item.locale}
                  href="/"
                  locale={item.locale}
                  aria-current={isActive ? 'true' : undefined}
                  className={
                    isActive
                      ? 'font-semibold text-[color:var(--color-foreground)]'
                      : 'transition-colors hover:text-[color:var(--color-foreground)]'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
