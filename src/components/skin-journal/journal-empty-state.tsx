"use client";

import { Button } from "@/components/ui/button";

interface JournalEmptyStateProps {
  icon: string;
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
  tone?: "accent" | "ai" | "secondary";
}

function emptyStateToneClass(tone: JournalEmptyStateProps["tone"]): string {
  if (tone === "ai") {
    return "bg-[color:var(--ai-bg)]";
  }

  if (tone === "secondary") {
    return "bg-secondary-soft";
  }

  return "bg-accent-soft";
}

export function JournalEmptyState({
  icon,
  title,
  body,
  cta,
  onCta,
  tone = "accent",
}: JournalEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <div
        aria-hidden
        className={`mx-auto grid h-24 w-24 place-items-center rounded-3xl text-[40px] leading-none ${emptyStateToneClass(tone)}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{body}</p>
      {cta && onCta ? (
        <Button className="mt-4" onClick={onCta}>
          {cta}
        </Button>
      ) : null}
    </div>
  );
}
