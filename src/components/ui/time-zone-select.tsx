'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDeferredValue, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  formatTimeZoneLabel,
  getSupportedTimeZones,
} from '@/lib/time-zone';
import { cn } from '@/lib/utils';

type Props = {
  value: string | null;
  onChange: (next: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function TimeZoneSelect({
  value,
  onChange,
  ariaLabel,
  placeholder,
  className,
  disabled,
}: Props) {
  const t = useTranslations('common.timeZoneSelect');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const timeZones = useMemo(() => getSupportedTimeZones(), []);
  const selected = value ? formatTimeZoneLabel(value) : null;
  const resolvedPlaceholder = placeholder ?? t('placeholder');

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return timeZones;
    }

    return timeZones.filter((timeZone) => {
      const label = formatTimeZoneLabel(timeZone).toLowerCase();
      return (
        timeZone.toLowerCase().includes(normalizedQuery) ||
        label.includes(normalizedQuery)
      );
    });
  }, [deferredQuery, timeZones]);

  const handlePick = (timeZone: string) => {
    onChange(timeZone);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery('');
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? resolvedPlaceholder}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-left text-sm outline-none transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted',
            className,
          )}
        >
          <span className={selected ? 'text-foreground' : undefined}>
            {selected ?? resolvedPlaceholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[260px] p-0"
        align="start"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div role="listbox" className="max-h-[260px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted">
              {t('noMatch', { query })}
            </p>
          ) : (
            filtered.map((timeZone) => {
              const isActive = timeZone === value;
              return (
                <button
                  key={timeZone}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handlePick(timeZone)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                    'hover:bg-accent-soft hover:text-accent-strong',
                    isActive && 'bg-accent-soft text-accent-strong',
                  )}
                >
                  <span>{formatTimeZoneLabel(timeZone)}</span>
                  {isActive ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
