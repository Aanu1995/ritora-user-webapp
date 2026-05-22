'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FileQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AppRoute } from '@/constants/app-routes';
import { QueryKey } from '@/constants/query-keys';
import type { ShelfProduct } from '@/types/shelf';

type Props = {
  productsMissingInci: string[];
  compact?: boolean;
};

export function InsufficientDataState({
  productsMissingInci,
  compact = false,
}: Props) {
  const t = useTranslations('ingredients.insufficientData');
  const queryClient = useQueryClient();
  const count = productsMissingInci.length;
  const firstId = productsMissingInci[0];
  const href = firstId
    ? `${AppRoute.Shelf}/${firstId}/edit`
    : AppRoute.Shelf;

  return (
    <div
      data-testid="insufficient-data-state"
      className={`flex items-start gap-3 rounded-2xl border border-dashed border-border-strong ${compact ? 'p-3' : 'p-4'}`}
    >
      <FileQuestion
        className="mt-0.5 h-4 w-4 flex-none text-accent-strong"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{t('title')}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {t(count === 1 ? 'bodySingle' : 'bodyPlural', { count })}
        </p>

        {count > 1 ? (
          <ul
            data-testid="insufficient-data-list"
            className="mt-2 flex flex-col gap-1"
          >
            {productsMissingInci.map((productId) => {
              const cached = queryClient.getQueryData<ShelfProduct>([
                QueryKey.ShelfProduct,
                productId,
              ]);
              const label = cached
                ? [cached.identity.brand, cached.identity.name]
                    .filter(Boolean)
                    .join(' · ') ||
                  cached.identity.name ||
                  t('list.itemFallback')
                : t('list.itemFallback');
              return (
                <li key={productId} className="text-xs">
                  <Link
                    href={`${AppRoute.Shelf}/${productId}/edit`}
                    className="font-medium text-accent-strong hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : firstId ? (
          <Link
            href={href}
            className="mt-2 inline-block text-xs font-medium text-accent-strong hover:underline"
          >
            {t('cta')}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
