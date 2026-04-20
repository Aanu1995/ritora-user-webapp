'use client';

import { LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useResolveUrl } from '@/hooks/use-shelf';
import { isSafeExternalUrl } from '@/lib/shelf-form';
import {
  type ResolvedLookup,
} from '@/types/shelf';

type Props = {
  onResolved: (resolved: ResolvedLookup) => void;
};

export function UrlTab({ onResolved }: Props) {
  const t = useTranslations('shelf.dialog.url');
  const resolve = useResolveUrl();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResolve = () => {
    if (!url.trim()) {
      return;
    }
    if (!isSafeExternalUrl(url.trim())) {
      setError(t('invalid'));
      return;
    }
    setError(null);
    resolve.mutate(url.trim(), {
      onSuccess: (result) => {
        if (!result) {
          setError(t('error'));
          return;
        }

        onResolved(result);
      },
      onError: () => {
        setError(t('error'));
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm focus-within:border-accent-strong">
          <LinkIcon className="h-4 w-4 text-muted" />
          <input
            aria-label={t('placeholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleResolve();
              }
            }}
            placeholder={t('placeholder')}
            className="h-10 flex-1 bg-transparent outline-none placeholder:text-muted"
            autoFocus
          />
        </label>
        <Button
          type="button"
          size="sm"
          disabled={resolve.isPending || !url.trim()}
          onClick={handleResolve}
          className="shrink-0"
        >
          {resolve.isPending ? (
            <LoadingIndicator label={t('fetching')} />
          ) : (
            t('fetch')
          )}
        </Button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
