'use client';

import { Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useSearchCatalogueBestMatch } from '@/hooks/use-shelf';
import { type ResolvedLookup } from '@/types/shelf';

type Props = {
  onResolved: (resolved: ResolvedLookup) => void;
  onSearchStart?: () => void;
};

export function SearchTab({ onResolved, onSearchStart }: Props) {
  const t = useTranslations('shelf.dialog.search');
  const [query, setQuery] = useState('');
  const [attemptedQuery, setAttemptedQuery] = useState('');
  const [searchState, setSearchState] = useState<'idle' | 'not-found'>('idle');
  const searchBestMatch = useSearchCatalogueBestMatch();
  const trimmedQuery = query.trim();
  const hasAttemptedSearch = attemptedQuery.trim().length >= 2;

  const handleSearch = () => {
    if (trimmedQuery.length < 2) {
      return;
    }

    setAttemptedQuery(trimmedQuery);
    setSearchState('idle');
    onSearchStart?.();
    searchBestMatch.mutate(trimmedQuery, {
      onSuccess: (result) => {
        if (!result) {
          setSearchState('not-found');
          return;
        }

        setQuery('');
        setAttemptedQuery('');
        setSearchState('idle');
        onResolved(result);
      },
      onError: () => {
        setSearchState('idle');
        toast.error(t('errorTitle'), {
          description: t('error'),
        });
      },
    });
  };

  let content: ReactNode;

  if (!hasAttemptedSearch) {
    content = <p className="text-sm text-muted">{t('empty')}</p>;
  } else if (searchState === 'not-found') {
    content = <p className="text-sm text-muted">{t('noResults')}</p>;
  } else {
    content = null;
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
          disabled={trimmedQuery.length < 2 || searchBestMatch.isPending}
          className="shrink-0"
        >
          {searchBestMatch.isPending ? (
            <LoadingIndicator label={t('searching')} size="sm" />
          ) : (
            t('searchAction')
          )}
        </Button>
      </div>

      {content}

      <p className="text-sm text-muted">{t('clearNotice')}</p>
    </div>
  );
}
