'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductDetailView } from './product-detail-view';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';
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
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
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
