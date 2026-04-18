import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { CookieConsent } from '@/components/cookie-consent';
import { COOKIE_CONSENT_NAME } from '@/constants/cookies';
import {
  THEME_PREFERENCE_COOKIE_NAME,
  ThemePreference,
  getThemeInitializationScript,
  parseThemePreference,
} from '@/lib/theme-preferences';
import { Providers } from './providers';
import { getSiteUrl, siteConfig } from '@/lib/site';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: '/',
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1712' },
  ],
  colorScheme: 'light dark' as const,
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
  const initialTheme =
    storedThemePreference &&
    storedThemePreference !== ThemePreference.System
      ? storedThemePreference
      : undefined;

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      data-theme={initialTheme}
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} h-full scroll-smooth`}
      style={initialTheme ? { colorScheme: initialTheme } : undefined}
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
