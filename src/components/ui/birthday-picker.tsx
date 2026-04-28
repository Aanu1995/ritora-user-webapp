'use client';

import { useTranslations } from 'next-intl';
import {
  type ChangeEvent,
  type FocusEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';

const ISO_FORMAT = 'YYYY-MM-DD';

type Props = {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  hint?: string | null;
  errorText?: string;
};

type Parts = { day: string; month: string; year: string };

function splitIso(value: string): Parts {
  const parsed = dayjs.utc(value, ISO_FORMAT, true);
  if (!parsed.isValid()) {
    return { day: '', month: '', year: '' };
  }
  return {
    day: String(parsed.date()).padStart(2, '0'),
    month: String(parsed.month() + 1).padStart(2, '0'),
    year: String(parsed.year()),
  };
}

function tryComposeIso(parts: Parts): string | null {
  const { day, month, year } = parts;
  if (!day || !month || !year || year.length !== 4) {
    return null;
  }
  const padded = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const parsed = dayjs.utc(padded, ISO_FORMAT, true);
  if (!parsed.isValid()) {
    return null;
  }
  return parsed.format(ISO_FORMAT);
}

const filterDigits = (raw: string, max: number) =>
  raw.replace(/\D/g, '').slice(0, max);

export function BirthdayPicker({
  value,
  onChange,
  onBlur,
  disabled,
  ariaLabel,
  className,
  hint,
  errorText,
}: Props) {
  const t = useTranslations('common.birthdayPicker');
  const groupId = useId();
  const dayId = `${groupId}-day`;
  const monthId = `${groupId}-month`;
  const yearId = `${groupId}-year`;
  const hintId = `${groupId}-hint`;
  const errorId = `${groupId}-error`;

  const [partsSnapshot, setPartsSnapshot] = useState<{
    value: string;
    parts: Parts;
  }>(() => ({
    value,
    parts: splitIso(value),
  }));
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  if (value !== partsSnapshot.value) {
    setPartsSnapshot({ value, parts: splitIso(value) });
  }

  const commit = (next: Parts) => {
    const composed = tryComposeIso(next);
    if (composed) {
      if (composed !== value) {
        onChange(composed);
      }
      return;
    }
    if (value) {
      onChange('');
    }
  };

  const updatePart = (key: keyof Parts, raw: string, max: number) => {
    const digits = filterDigits(raw, max);
    const next = { ...partsSnapshot.parts, [key]: digits };
    setPartsSnapshot((current) => ({ ...current, parts: next }));
    commit(next);
    return digits;
  };

  const resolvedHint = hint === null ? null : hint ?? t('hint');
  const resolvedLabel = ariaLabel ?? t('label');
  const describedBy =
    [resolvedHint ? hintId : null, errorText ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const fieldClass =
    'h-11 w-full rounded-xl border border-border bg-surface px-3 text-center text-sm text-foreground transition placeholder:text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-60';

  return (
    <fieldset
      disabled={disabled}
      className={cn('w-full', className)}
      aria-describedby={describedBy}
      aria-invalid={errorText ? true : undefined}
    >
      <legend className="sr-only">{resolvedLabel}</legend>
      <div className="flex items-end gap-3">
        <label htmlFor={dayId} className="flex w-16 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">{t('day')}</span>
          <input
            id={dayId}
            type="text"
            inputMode="numeric"
            autoComplete="bday-day"
            aria-label={`${resolvedLabel} ${t('day')}`}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={describedBy}
            maxLength={2}
            placeholder={t('dayPlaceholder')}
            value={partsSnapshot.parts.day}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const next = updatePart('day', event.target.value, 2);
              if (next.length === 2) {
                monthRef.current?.focus();
                monthRef.current?.select();
              }
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              if (event.target.value && event.target.value.length === 1) {
                updatePart('day', event.target.value.padStart(2, '0'), 2);
              }
              onBlur?.();
            }}
            className={fieldClass}
          />
        </label>
        <label htmlFor={monthId} className="flex w-16 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">{t('month')}</span>
          <input
            ref={monthRef}
            id={monthId}
            type="text"
            inputMode="numeric"
            autoComplete="bday-month"
            aria-label={`${resolvedLabel} ${t('month')}`}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={describedBy}
            maxLength={2}
            placeholder={t('monthPlaceholder')}
            value={partsSnapshot.parts.month}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const next = updatePart('month', event.target.value, 2);
              if (next.length === 2) {
                yearRef.current?.focus();
                yearRef.current?.select();
              }
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              if (event.target.value && event.target.value.length === 1) {
                updatePart('month', event.target.value.padStart(2, '0'), 2);
              }
              onBlur?.();
            }}
            className={fieldClass}
          />
        </label>
        <label htmlFor={yearId} className="flex w-24 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">{t('year')}</span>
          <input
            ref={yearRef}
            id={yearId}
            type="text"
            inputMode="numeric"
            autoComplete="bday-year"
            aria-label={`${resolvedLabel} ${t('year')}`}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={describedBy}
            maxLength={4}
            placeholder={t('yearPlaceholder')}
            value={partsSnapshot.parts.year}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updatePart('year', event.target.value, 4);
            }}
            onBlur={onBlur}
            className={fieldClass}
          />
        </label>
      </div>
      {resolvedHint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {resolvedHint}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className="mt-2 text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
    </fieldset>
  );
}
