export const siteConfig = {
  name: 'Ritora',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  nav: [
    { href: '#problem', labelKey: 'whyRitora' },
    { href: '#how-it-works', labelKey: 'howItWorks' },
    { href: '#features', labelKey: 'features' },
    { href: '#faq', labelKey: 'faq' },
  ] as const,
} as const;

export function getSiteUrl(): URL {
  return new URL(siteConfig.url);
}
