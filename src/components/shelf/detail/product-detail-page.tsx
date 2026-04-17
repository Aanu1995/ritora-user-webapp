'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductDetailView } from './product-detail-view';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRoute } from '@/constants/app-routes';
import { useShelfProduct } from '@/hooks/use-shelf';

type Props = {
  productId: string;
};

export function ProductDetailPage({ productId }: Props) {
  const t = useTranslations('common');
  const tShelf = useTranslations('shelf.empty');
  const router = useRouter();
  const product = useShelfProduct(productId);

  useEffect(() => {
    if (product.isError) {
      // 404 → bounce back to the shelf
      router.replace(AppRoute.Shelf);
    }
  }, [product.isError, router]);

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

  if (product.isError || !product.data) {
    return (
      <RetryPanel
        title={t('error')}
        description={tShelf('description')}
        actionLabel={t('retry')}
        onAction={() => {
          void product.refetch();
        }}
      />
    );
  }

  return (
    <ProductDetailView
      product={product.data}
      onAfterMutation={() => {
        // Optimistic state already cleared via TanStack Query;
        // for delete the user will be bounced via the useEffect above.
      }}
    />
  );
}
