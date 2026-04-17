'use client';

import { Camera, Link as LinkIcon, Search as SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ScanTab } from './scan-tab';
import { SearchTab } from './search-tab';
import { UrlTab } from './url-tab';
import { cn } from '@/lib/utils';
import {
  DataProvenance,
  type ShelfProductPartial,
} from '@/types/shelf';

type Props = {
  onResult: (
    partial: ShelfProductPartial,
    provenance: DataProvenance,
  ) => void;
};

type Mode = 'scan' | 'search' | 'url';

const MODES: Array<{
  value: Mode;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'scan', labelKey: 'tabs.scan', icon: Camera },
  { value: 'search', labelKey: 'tabs.search', icon: SearchIcon },
  { value: 'url', labelKey: 'tabs.url', icon: LinkIcon },
];

export function QuickLookupCard({ onResult }: Props) {
  const t = useTranslations('shelf.dialog');
  const tLookup = useTranslations('shelf.dialog.lookup');
  const [mode, setMode] = useState<Mode>('search');

  const handleResult = (
    partial: ShelfProductPartial,
    provenance: DataProvenance,
  ) => {
    onResult(partial, provenance);
  };

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold -tracking-[0.01em]">
          {tLookup('heading')}
        </h2>
        <p className="text-sm text-muted">
          {tLookup('description')}
        </p>
      </header>

      <div
        role="tablist"
        aria-label={tLookup('tablistLabel')}
        className="mt-4 inline-flex rounded-full bg-surface-muted p-1"
      >
        {MODES.map(({ value, labelKey, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition',
                active
                  ? 'bg-surface text-foreground shadow-soft'
                  : 'text-muted hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(labelKey)}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {mode === 'scan' ? (
          <ScanTab onSwitchToManual={() => setMode('search')} />
        ) : mode === 'search' ? (
          <SearchTab
            onPick={(partial) =>
              handleResult(partial, DataProvenance.Catalogue)
            }
          />
        ) : (
          <UrlTab
            onResolved={(partial) =>
              handleResult(partial, DataProvenance.UrlFetch)
            }
          />
        )}
      </div>
    </section>
  );
}
