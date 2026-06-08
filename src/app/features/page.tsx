import type { Metadata } from 'next';
import { MarketingPage } from '@/components/seo/marketing-page';
import { marketingPages } from '@/lib/marketing-pages';

const page = marketingPages.features;

export const metadata: Metadata = {
  title: page.metadataTitle,
  description: page.metadataDescription,
  alternates: { canonical: page.path },
};

export default function FeaturesPage() {
  return <MarketingPage {...page} />;
}
