import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  defaultLocale,
  type Locale,
  LOCALE_COOKIE,
  isLocale,
} from './config';

function parseAcceptLanguage(header: string): Locale {
  const tags = header
    .split(',')
    .map((tag) => tag.split(';')[0].trim().toLowerCase())
    .filter(Boolean);

  for (const tag of tags) {
    const base = tag.split('-')[0];
    if (isLocale(base)) {
      return base;
    }
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const headerLocale = headerList.get('accept-language') ?? '';

  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : parseAcceptLanguage(headerLocale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
