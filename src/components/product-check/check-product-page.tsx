import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/app/page-header';
import { CheckProductClient } from './check-product-client';

export async function CheckProductPage() {
  const t = await getTranslations('checkProduct.page');

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('body')} />
      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-5">
        <CheckProductClient />
      </div>
    </div>
  );
}
