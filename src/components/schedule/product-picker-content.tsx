'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useShelfProducts } from '@/hooks/use-shelf';
import { useShelfDateContext } from '@/hooks/use-shelf-time-zone';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
import {
  ShelfSort,
  ShelfStatFilter,
} from '@/types/shelf';
import type { RoutineStepProductSummary } from '@/types/schedule';
import { cn } from '@/lib/utils';
import {
  filterSelectableProducts,
  resolveProductPickerCategory,
  resolveProductPickerQueryCategory,
} from './product-picker-content.utils';

type ProductPickerContentProps = {
  onSelect: (product: RoutineStepProductSummary) => void;
  onClose: () => void;
  showCloseButton?: boolean;
};

export function ProductPickerContent({
  onSelect,
  onClose,
  showCloseButton = false,
}: ProductPickerContentProps) {
  const t = useTranslations('schedule.productPicker');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const shelfDateContext = useShelfDateContext();
  const pickerStepLabel = useScheduleUiStore(
    (state) => state.productPickerStepLabel,
  );
  const productCategory = resolveProductPickerCategory(pickerStepLabel);

  const { data: products = [], isLoading } = useShelfProducts(
    {
      stat: ShelfStatFilter.All,
      category: resolveProductPickerQueryCategory(pickerStepLabel),
      search: debouncedSearch,
      sort: ShelfSort.Alphabetical,
    },
    shelfDateContext,
  );

  const filtered = useMemo(
    () => filterSelectableProducts(products, productCategory),
    [productCategory, products],
  );

  const handleSelect = (summary: RoutineStepProductSummary) => {
    onSelect(summary);
  };

  return (
    <div className="flex h-full flex-col">
      <header
        className={cn(
          'border-b border-border px-5 py-4',
          !showCloseButton && 'pr-12',
          showCloseButton && 'flex items-start justify-between gap-3',
        )}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
        </div>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-accent-soft"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="border-b border-border px-5 py-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <ul className="space-y-1" aria-label="Loading products">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
                <Skeleton className="h-3 w-12 shrink-0" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <p className="mx-5 my-8 text-center text-sm text-muted">
            {search ? t('empty') : t('emptyShelf')}
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((product) => {
              const summary: RoutineStepProductSummary = {
                id: product.id,
                brand: product.identity.brand,
                name: product.identity.name,
                category: product.identity.category,
                imageUrl: product.identity.imageUrls?.[0] ?? null,
                status: product.status,
              };
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(summary)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-accent-soft',
                      'focus-visible:outline-none focus-visible:bg-accent-soft',
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                      {summary.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={summary.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted">
                          {summary.category.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium uppercase text-muted">
                        {summary.category}
                      </div>
                      <div className="truncate text-sm font-semibold text-foreground">
                        {summary.brand}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {summary.name}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
