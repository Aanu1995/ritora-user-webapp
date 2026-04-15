import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './language-switcher';
import { AppRoute } from '@/constants/app-routes';
import { siteConfig } from '@/lib/site';

export async function SiteFooter() {
  const [tNav, tFooter, tAuth] = await Promise.all([
    getTranslations('nav'),
    getTranslations('footer'),
    getTranslations('auth'),
  ]);

  const navLinks = siteConfig.nav.map((item) => ({
    href: item.href,
    label: tNav(item.labelKey),
  }));

  return (
    <footer className="border-t border-border bg-surface/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
            {siteConfig.name}
          </p>
          <p className="max-w-md text-sm leading-7 text-muted">
            {tFooter('brandBlurb')}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {tFooter('columns.explore')}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {tFooter('columns.legal')}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link
              href={AppRoute.Privacy}
              className="transition-colors hover:text-foreground"
            >
              {tAuth('privacyPolicy')}
            </Link>
            <Link
              href={AppRoute.Terms}
              className="transition-colors hover:text-foreground"
            >
              {tAuth('termsOfService')}
            </Link>
            <Link
              href={AppRoute.Cookies}
              className="transition-colors hover:text-foreground"
            >
              {tFooter('cookieNotice')}
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {tFooter('columns.language')}
          </p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
