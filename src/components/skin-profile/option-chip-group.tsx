"use client";

import { cn } from "@/lib/utils";

interface OptionChipGroupProps {
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
  translateOption: (value: string) => string;
  multiSelect?: boolean;
}

export function OptionChipGroup({
  options,
  values,
  onToggle,
  translateOption,
  multiSelect = true,
}: OptionChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const active = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "border-accent-strong bg-accent-soft text-accent-strong"
                : "border-border text-muted hover:border-accent/40 hover:text-foreground",
            )}
            aria-pressed={active}
            role={multiSelect ? "checkbox" : "radio"}
          >
            {translateOption(option)}
          </button>
        );
      })}
    </div>
  );
}
