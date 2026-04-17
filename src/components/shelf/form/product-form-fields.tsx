'use client';

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
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
