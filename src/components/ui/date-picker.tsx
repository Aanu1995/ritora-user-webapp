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
  /** ISO date string (YYYY-MM-DD) or empty string. */
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** When true, shows an X button to clear the value. */
  allowClear?: boolean;
  className?: string;
};

function parseValue(value: string): Date | undefined {
  return toShelfCalendarSelectionDate(value);
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
  allowClear = true,
  className,
}: Props) {
  const t = useTranslations('common.datePicker');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const displayValue = formatLocalizedDate(value, locale);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? resolvedPlaceholder}
          className={cn(
            'inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-left text-sm transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-60',
            !selected && 'text-muted',
            className,
          )}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted" />
            <span>{displayValue ?? resolvedPlaceholder}</span>
          </span>
          {allowClear && selected ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label={t('clear')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger"
            >
              <X className="h-3 w-3" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
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
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
