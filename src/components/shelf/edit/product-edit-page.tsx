'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { ProductEditForm } from './product-edit-form';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRoute } from '@/constants/app-routes';
import { useShelfProduct } from '@/hooks/use-shelf';

type Props = {
  productId: string;
};

export function ProductEditPage({ productId }: Props) {
  const t = useTranslations('common');
  const router = useRouter();
  const product = useShelfProduct(productId);

  useEffect(() => {
    if (product.isError) {
      router.replace(AppRoute.Shelf);
    }
  }, [product.isError, router]);

  if (product.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (product.isError || !product.data) {
    return (
      <RetryPanel
        title={t('error')}
        description={t('error')}
        actionLabel={t('retry')}
        onAction={() => {
          void product.refetch();
        }}
      />
    );
  }

  return <ProductEditForm product={product.data} />;
}
