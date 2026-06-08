import type { Metadata } from 'next';
import { MarketingPage } from '@/components/seo/marketing-page';
import { buildMarketingMetadata, marketingPages } from '@/lib/marketing-pages';

const page = marketingPages.smartRoutine;

export const metadata: Metadata = buildMarketingMetadata(page);

export default function SmartRoutinePage() {
  return <MarketingPage {...page} />;
}
