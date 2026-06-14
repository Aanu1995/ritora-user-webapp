import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import './globals.css';
import { CookieConsent } from '@/components/cookie-consent';
import { COOKIE_CONSENT_NAME } from '@/constants/cookies';
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_PREFERENCE_COOKIE_NAME,
  getThemeInitializationScript,
  normalizeThemePreference,
  parseThemePreference,
  resolveThemePreference,
} from '@/lib/theme-preferences';
import { Providers } from './providers';
import { getSiteUrl, siteConfig } from '@/lib/site';

function getOpenGraphLocale(locale: string) {
  if (locale === 'es') {
    return 'es_ES';
  }

  return locale === 'sv' ? 'sv_SE' : 'en_US';
}

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('site'),
  ]);
  const title = t('title');
  const description = t('description');

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: '/',
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const viewport = {
  themeColor: '#f7f5f0',
  colorScheme: 'light' as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    cookies(),
  ]);
  const hasStoredCookieConsent = cookieStore.has(COOKIE_CONSENT_NAME);
  const storedThemePreference = parseThemePreference(
    cookieStore.get(THEME_PREFERENCE_COOKIE_NAME)?.value,
  );
  const initialTheme = resolveThemePreference(
    normalizeThemePreference(storedThemePreference ?? DEFAULT_THEME_PREFERENCE),
  );

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      data-theme={initialTheme}
      suppressHydrationWarning
      className="h-full scroll-smooth"
      style={{ colorScheme: initialTheme }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitializationScript(),
          }}
        />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers initialThemePreference={storedThemePreference}>
            {children}
          </Providers>
          <CookieConsent hasStoredPreference={hasStoredCookieConsent} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
