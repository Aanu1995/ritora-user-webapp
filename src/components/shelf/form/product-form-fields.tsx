'use client';

import {
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-muted">
      {children}
    </h3>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
  badge?: ReactNode;
  fullWidth?: boolean;
  error?: string;
};

export function Field({
  label,
  children,
  hint,
  badge,
  fullWidth,
  error,
}: FieldProps) {
  return (
    <label className={`flex flex-col ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <span>{label}</span>
        {badge}
      </span>
      {children}
      {error ? (
        <span className="mt-1 text-[11px] text-danger" role="alert">
          {error}
        </span>
      ) : null}
      {hint ? <span className="mt-1 text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  value: string;
  onChange: (next: string) => void;
  invalid?: boolean;
};

export function TextInput({
  value,
  onChange,
  className,
  invalid = false,
  ...rest
}: TextInputProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-11 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-accent-strong focus:outline-none disabled:opacity-60',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      aria-invalid={invalid}
      {...rest}
    />
  );
}

type TextAreaInputProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value'
> & {
  value: string;
  onChange: (next: string) => void;
  invalid?: boolean;
};

export function TextAreaInput({
  value,
  onChange,
  className,
  invalid = false,
  ...rest
}: TextAreaInputProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-strong focus:outline-none disabled:opacity-60',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      aria-invalid={invalid}
      {...rest}
    />
  );
}

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

type ListTextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'onBlur'
> & {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

/**
 * A comma-separated list input that keeps the user's raw text locally while
 * also committing a parsed string array to form state on every edit. This
 * keeps validation current without stripping intermediate whitespace/commas
 * from the visible input.
 */
export function ListTextInput({
  value,
  onChange,
  invalid = false,
  className,
  onBlur,
  ...rest
}: ListTextInputProps) {
  const joined = value.join(', ');
  const [raw, setRaw] = useState(joined);
  const [lastExternalValue, setLastExternalValue] = useState(joined);

  // Sync the raw string when the external array changed for reasons other
  // than our own commit (e.g., a barcode lookup pre-filled values). This
  // follows React's "storing info from previous renders" pattern — the
  // setState triggers a synchronous re-render with the updated local state.
  if (joined !== lastExternalValue) {
    setLastExternalValue(joined);
    setRaw(joined);
  }

  const commitRawValue = (nextRaw: string) => {
    const parsed = parseList(nextRaw);
    const normalized = parsed.join(', ');
    if (normalized !== joined) {
      onChange(parsed);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const parsed = parseList(raw);
    const normalized = parsed.join(', ');
    setRaw(normalized);
    setLastExternalValue(normalized);
    if (normalized !== joined) {
      onChange(parsed);
    }
    onBlur?.(event);
  };

  return (
    <input
      value={raw}
      onChange={(event) => {
        const nextRaw = event.target.value;
        setRaw(nextRaw);
        commitRawValue(nextRaw);
      }}
      onBlur={handleBlur}
      className={cn(
        'h-11 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-accent-strong focus:outline-none disabled:opacity-60',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      aria-invalid={invalid}
      {...rest}
    />
  );
}

type ListTextAreaInputProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value' | 'onBlur'
> & {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
};

/**
 * Multi-line variant of {@link ListTextInput}. Used for longer lists like
 * INCI ingredients.
 */
export function ListTextAreaInput({
  value,
  onChange,
  invalid = false,
  className,
  onBlur,
  ...rest
}: ListTextAreaInputProps) {
  const joined = value.join(', ');
  const [raw, setRaw] = useState(joined);
  const [lastExternalValue, setLastExternalValue] = useState(joined);

  if (joined !== lastExternalValue) {
    setLastExternalValue(joined);
    setRaw(joined);
  }

  const commitRawValue = (nextRaw: string) => {
    const parsed = parseList(nextRaw);
    const normalized = parsed.join(', ');
    if (normalized !== joined) {
      onChange(parsed);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    const parsed = parseList(raw);
    const normalized = parsed.join(', ');
    setRaw(normalized);
    setLastExternalValue(normalized);
    if (normalized !== joined) {
      onChange(parsed);
    }
    onBlur?.(event);
  };

  return (
    <textarea
      value={raw}
      onChange={(event) => {
        const nextRaw = event.target.value;
        setRaw(nextRaw);
        commitRawValue(nextRaw);
      }}
      onBlur={handleBlur}
      className={cn(
        'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-strong focus:outline-none disabled:opacity-60',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      aria-invalid={invalid}
      {...rest}
    />
  );
}
