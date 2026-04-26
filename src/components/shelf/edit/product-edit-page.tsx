'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { ProductEditForm } from './product-edit-form';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRoute } from '@/constants/app-routes';
import { useShelfProduct } from '@/hooks/use-shelf';
import { getApiErrorStatus } from '@/lib/api-error';

type Props = {
  productId: string;
};

export function ProductEditPage({ productId }: Props) {
  const t = useTranslations('shelf.errors');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const product = useShelfProduct(productId);
  const shouldRedirectToShelf =
    product.isError &&
    !product.data &&
    getApiErrorStatus(product.error) === 404;

  useEffect(() => {
    if (shouldRedirectToShelf) {
      router.replace(AppRoute.Shelf);
    }
  }, [shouldRedirectToShelf, router]);

  if (product.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (shouldRedirectToShelf) {
    return null;
  }

  if (product.data) {
    return <ProductEditForm product={product.data} />;
  }

  return (
    <RetryPanel
      title={t('loadProductTitle')}
      description={t('loadProductDescription')}
      actionLabel={tCommon('retry')}
      onAction={() => {
        void product.refetch();
      }}
    />
  );
}
