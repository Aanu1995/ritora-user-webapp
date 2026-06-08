import type { Metadata } from 'next';
import { MarketingPage } from '@/components/seo/marketing-page';
import { marketingPages } from '@/lib/marketing-pages';

const page = marketingPages.smartRoutine;

export const metadata: Metadata = {
  title: page.metadataTitle,
  description: page.metadataDescription,
  alternates: { canonical: page.path },
};

export default function SmartRoutinePage() {
  return <MarketingPage {...page} />;
}
