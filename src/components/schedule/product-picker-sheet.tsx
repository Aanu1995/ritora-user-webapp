'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useShelfProducts } from '@/hooks/use-shelf';
import {
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
} from '@/types/shelf';
import type { RoutineStepProductSummary } from '@/types/schedule';
import { cn } from '@/lib/utils';

type ProductPickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: RoutineStepProductSummary) => void;
};

export function ProductPickerSheet({
  open,
  onOpenChange,
  onSelect,
}: ProductPickerSheetProps) {
  const t = useTranslations('schedule.productPicker');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data: products = [], isLoading } = useShelfProducts({
    stat: ShelfStatFilter.All,
    category: ShelfCategoryFilter.All,
    search: deferredSearch,
    sort: ShelfSort.Alphabetical,
  });

  const filtered = useMemo(
    () => products.filter((p) => p.status !== 'archived'),
    [products],
  );
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col gap-0 border-l border-border p-0 sm:w-[480px] sm:max-w-none"
      >
        <header className="border-b border-border px-5 py-4 pr-12">
          <SheetTitle className="text-lg">{t('title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('title')}</SheetDescription>
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
            <div className="space-y-2 px-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
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
                      onClick={() => {
                        onSelect(summary);
                        handleOpenChange(false);
                      }}
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
      </SheetContent>
    </Sheet>
  );
}
