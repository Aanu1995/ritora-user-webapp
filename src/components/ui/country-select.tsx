'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { Content as PopoverContent } from '@radix-ui/react-popover';
import { Popover, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { COUNTRIES, flagEmoji, getCountry } from '@/constants/countries';

type Props = {
  value: string | null;
  onChange: (next: string | null) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  ariaLabel,
  placeholder,
  className,
  disabled,
}: Props) {
  const t = useTranslations('common.countrySelect');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const selected = getCountry(value);
  const resolvedPlaceholder = placeholder ?? t('placeholder');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q),
    );
  }, [query]);

  const handlePick = (code: string) => {
    onChange(code);
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
            'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-left text-sm outline-none transition hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted',
            className,
          )}
        >
          {selected ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>{flagEmoji(selected.code)}</span>
              <span className="text-foreground">{selected.name}</span>
            </span>
          ) : (
            <span>{resolvedPlaceholder}</span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-[80] w-[--radix-popover-trigger-width] min-w-[260px] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-[var(--shadow-hero)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div
          ref={listRef}
          role="listbox"
          className="max-h-[260px] overflow-y-auto p-1"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted">
              {t('noMatch', { query })}
            </p>
          ) : (
            filtered.map((country) => {
              const isActive = country.code === value;
              return (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handlePick(country.code)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                    'hover:bg-accent-soft hover:text-accent-strong',
                    isActive && 'bg-accent-soft text-accent-strong',
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>{flagEmoji(country.code)}</span>
                    <span>{country.name}</span>
                  </span>
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
