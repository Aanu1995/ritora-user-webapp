import type { MetadataRoute } from 'next';
import { PUBLIC_METADATA_ROUTES } from '@/constants/app-routes';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_METADATA_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === PUBLIC_METADATA_ROUTES[0] ? 'weekly' : 'monthly',
    priority: path === PUBLIC_METADATA_ROUTES[0] ? 1 : 0.4,
  }));
}
