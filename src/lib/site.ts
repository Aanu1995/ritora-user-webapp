export const siteConfig = {
  name: 'Ritora',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  nav: [
    { href: '/#how-it-works', labelKey: 'howItWorks' },
    { href: '/features', labelKey: 'features' },
    { href: '/skin-journal', labelKey: 'skinJournal' },
    { href: '/product-checker', labelKey: 'productChecker' },
    { href: '/#privacy', labelKey: 'privacy' },
    { href: '/#faq', labelKey: 'faq' },
  ] as const,
} as const;

export function getSiteUrl(): URL {
  return new URL(siteConfig.url);
}
