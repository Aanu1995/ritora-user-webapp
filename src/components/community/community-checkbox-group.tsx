"use client";

import { cn } from "@/lib/utils";
import { CommunityFieldError, Field } from "./community-shared";
import type { SelectOption } from "./community-review-form-utils";

export function CommunityCheckboxGroup({
  errors,
  hint,
  label,
  onChange,
  options,
  required = false,
  value,
}: {
  errors: readonly unknown[];
  hint?: string;
  label: string;
  onChange: (nextValue: string[]) => void;
  options: readonly SelectOption[];
  required?: boolean;
  value: string[];
}) {
  return (
    <Field hint={hint} label={label} required={required}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                checked
                  ? "border-accent/40 bg-accent-soft text-accent-strong"
                  : "border-border bg-background text-muted hover:text-foreground",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...value, option.value]
                    : value.filter((item) => item !== option.value);
                  onChange(next);
                }}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <CommunityFieldError errors={errors} />
    </Field>
  );
}
