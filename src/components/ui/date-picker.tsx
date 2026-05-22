'use client';

import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { formatLocalizedDate, toDateInputValue } from '@/lib/dayjs';
import { toShelfCalendarSelectionDate } from '@/lib/shelf-date';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  allowClear?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
};

function parseValue(value: string): Date | undefined {
  return toShelfCalendarSelectionDate(value);
}

function buildDisabledMatcher(
  minDate: Date | undefined,
  maxDate: Date | undefined,
) {
  if (!minDate && !maxDate) return undefined;
  if (minDate && maxDate) return { before: minDate, after: maxDate };
  if (minDate) return { before: minDate };
  return { after: maxDate as Date };
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
  allowClear = true,
  className,
  minDate,
  maxDate,
}: Props) {
  const t = useTranslations('common.datePicker');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const displayValue = formatLocalizedDate(value, locale);

  const showClear = allowClear && Boolean(selected) && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('relative w-full', className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel ?? resolvedPlaceholder}
            className={cn(
              'inline-flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-surface text-left text-sm transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-60',
              showClear ? 'pl-3 pr-10' : 'px-3',
              !selected && 'text-muted',
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate">{displayValue ?? resolvedPlaceholder}</span>
          </button>
        </PopoverTrigger>
        {showClear ? (
          <button
            type="button"
            aria-label={t('clear')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange('');
            }}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              return;
            }
            onChange(toDateInputValue(date));
            setOpen(false);
          }}
          disabled={buildDisabledMatcher(minDate, maxDate)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
