import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { CookieConsent } from '@/components/cookie-consent';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
