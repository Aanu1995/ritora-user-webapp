'use client';

import { Plus, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ProductIllustration } from '../product-illustration';
import { Button } from '@/components/ui/button';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchCatalogue } from '@/hooks/use-shelf';
import {
  type CatalogueIdentity,
  type CatalogueSuggestion,
  ProductCategory,
  type ShelfProductPartial,
} from '@/types/shelf';

type Props = {
  onPick: (partial: ShelfProductPartial) => void;
};

function suggestionToIdentity(s: CatalogueSuggestion): CatalogueIdentity {
  return {
    brand: s.brand,
    name: s.name,
    category: s.category,
    barcode: s.barcode,
    imageUrls: s.imageUrls,
    sizeMl: s.sizeMl,
    description: null,
    benefits: [],
    suitedFor: [],
    inciIngredients: [],
    inciLastConfirmedAt: null,
  };
}

export function SearchTab({ onPick }: Props) {
  const t = useTranslations('shelf.dialog.search');
  const tCat = useTranslations('shelf.category');
  const tCard = useTranslations('shelf.card');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const {
    data: results = [],
    isError,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useSearchCatalogue(submittedQuery);
  const trimmedQuery = query.trim();
  const hasSubmittedQuery = submittedQuery.trim().length >= 2;
  const isInitialLoading = isFetching && results.length === 0;
  const hasSearchError = isError && results.length === 0;

  const handleSearch = () => {
    if (trimmedQuery.length < 2) {
      return;
    }

    setSubmittedQuery(trimmedQuery);
  };

  let content: ReactNode;

  if (!hasSubmittedQuery) {
    content = <p className="text-sm text-muted">{t('empty')}</p>;
  } else if (isInitialLoading) {
    content = <SearchResultsSkeleton />;
  } else if (hasSearchError) {
    content = (
      <RetryPanel
        title={t('errorTitle')}
        description={t('error')}
        actionLabel={t('retry')}
        onAction={() => {
          void refetch();
        }}
      />
    );
  } else if (results.length === 0) {
    content = <p className="text-sm text-muted">{t('noResults')}</p>;
  } else {
    content = (
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {results.map((suggestion) => {
            const sizeLabel = suggestion.sizeMl
              ? ` · ${suggestion.sizeMl} ${tCard('sizeSuffix')}`
              : '';

            return (
              <li
                key={`${suggestion.brand}-${suggestion.name}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
                  <ProductIllustration
                    brand={suggestion.brand}
                    category={suggestion.category as ProductCategory}
                    className="h-9 w-auto"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {suggestion.brand}
                  </span>
                  <div className="line-clamp-1 text-[14px] font-semibold">
                    {suggestion.name}
                  </div>
                  <div className="text-xs text-muted">
                    {tCat(suggestion.category)}
                    {sizeLabel}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    onPick({
                      identity: suggestionToIdentity(suggestion),
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('addAction')}
                </Button>
              </li>
            );
          })}
        </ul>
        {hasNextPage ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void fetchNextPage();
              }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? t('loadingMore') : t('loadMore')}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2.5 text-sm focus-within:border-accent-strong">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            aria-label={t('placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
        <Button
          type="button"
          size="sm"
          onClick={handleSearch}
          disabled={isFetching || trimmedQuery.length < 2}
          className="shrink-0"
        >
          {isFetching ? t('searching') : t('searchAction')}
        </Button>
      </div>

      {content}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5"
        >
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-9 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
