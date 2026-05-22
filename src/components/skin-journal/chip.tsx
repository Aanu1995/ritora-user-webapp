"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "default" | "accent" | "danger" | "warning" | "ai";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  variant?: ChipVariant;
  onClick?: () => void;
  asButton?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function Chip({
  children,
  selected,
  variant = "default",
  onClick,
  asButton,
  ariaLabel,
  className,
}: ChipProps) {
  const Comp = (asButton || onClick ? "button" : "span") as
    | "button"
    | "span";

  const base =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition";

  const stateClass = (() => {
    if (variant === "danger") {
      return selected
        ? "border-danger bg-danger/10 text-danger font-semibold"
        : "border-danger/40 text-danger/80 bg-surface";
    }
    if (variant === "warning") {
      return selected
        ? "border-[color:var(--warning)] bg-warning-soft text-[color:var(--warning)] font-semibold"
        : "border-[color:rgba(184,84,10,0.25)] text-[color:var(--warning)]/80 bg-surface";
    }
    if (variant === "ai") {
      return selected
        ? "border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)] font-semibold"
        : "border-[color:var(--ai-border)] text-[color:var(--ai-fg)]/90 bg-surface";
    }
    if (variant === "accent" || selected) {
      return "border-accent bg-accent-soft text-accent-strong font-semibold";
    }
    return "border-border bg-surface text-foreground hover:border-border-strong";
  })();

  return (
    <Comp
      type={Comp === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={Comp === "button" && selected ? true : undefined}
      className={cn(
        base,
        stateClass,
        Comp === "button" && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
