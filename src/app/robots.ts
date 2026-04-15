import type { MetadataRoute } from 'next';
import { PROTECTED_APP_ROUTES } from '@/constants/app-routes';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...PROTECTED_APP_ROUTES],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
