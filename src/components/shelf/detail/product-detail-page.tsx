'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductDetailView } from './product-detail-view';
import { ProductDetailSkeleton } from './product-detail-skeleton';
import { RetryPanel } from '@/components/ui/retry-panel';
import { AppRoute } from '@/constants/app-routes';
import { useShelfProduct } from '@/hooks/use-shelf';
import { getApiErrorStatus } from '@/lib/api-error';

type Props = {
  productId: string;
};

export function ProductDetailPage({ productId }: Props) {
  const t = useTranslations('common');
  const tShelf = useTranslations('shelf.errors');
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
    return <ProductDetailSkeleton />;
  }

  if (shouldRedirectToShelf) {
    return null;
  }

  if (product.data) {
    return (
      <ProductDetailView
        product={product.data}
        onAfterMutation={() => {
          // Optimistic state already cleared via TanStack Query.
        }}
      />
    );
  }

  return (
    <RetryPanel
      title={tShelf('loadProductTitle')}
      description={tShelf('loadProductDescription')}
      actionLabel={t('retry')}
      onAction={() => {
        void product.refetch();
      }}
    />
  );
}
