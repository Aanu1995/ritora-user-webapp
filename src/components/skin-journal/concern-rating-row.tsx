"use client";

import { cn } from "@/lib/utils";

interface ConcernRatingRowProps {
  label: string;
  value?: number | null;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  variant?: "default" | "danger";
}

export function ConcernRatingRow({
  label,
  value,
  onChange,
  variant = "default",
}: ConcernRatingRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-dashed border-border py-1.5 last:border-b-0">
      <span className="w-24 shrink-0 truncate text-xs font-semibold">
        {label}
      </span>
      <div className="flex shrink-0 gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${label} ${n}`}
              aria-pressed={selected}
              onClick={() => onChange?.(n as 1 | 2 | 3 | 4 | 5)}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border text-[11px] font-semibold transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                selected
                  ? variant === "danger"
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-accent bg-accent-soft text-accent-strong"
                  : "border-border bg-surface text-foreground hover:border-border-strong",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
