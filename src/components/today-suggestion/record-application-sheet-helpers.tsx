"use client";

import { useRef } from "react";

type AppliedTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function AppliedTimePicker({
  value,
  onChange,
  onBlur,
  disabled,
  ariaLabel,
}: AppliedTimePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if ("showPicker" in input) {
      try {
        (input as HTMLInputElement & { showPicker: () => void }).showPicker();
      } catch {
        // Focus alone is enough on browsers without showPicker.
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="time"
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (
          event.key !== "Tab" &&
          event.key !== "Escape" &&
          event.key !== "Enter"
        ) {
          event.preventDefault();
        }
      }}
      inputMode="none"
      className="cursor-pointer rounded-lg border border-[color:var(--border-strong)] bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none transition hover:bg-accent-soft hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export function formatTargetDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}
