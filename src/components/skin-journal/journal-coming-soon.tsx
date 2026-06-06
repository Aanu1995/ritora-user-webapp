"use client";

interface JournalComingSoonProps {
  icon: string;
  badge: string;
  title: string;
  body: string;
  tone?: "ai" | "secondary";
}

function comingSoonToneClass(tone: JournalComingSoonProps["tone"]): string {
  return tone === "secondary" ? "bg-secondary-soft" : "bg-ai-bg";
}

export function JournalComingSoon({
  icon,
  badge,
  title,
  body,
  tone = "ai",
}: JournalComingSoonProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-surface px-6 py-16 text-center">
      <div
        aria-hidden
        className={`mx-auto grid h-24 w-24 place-items-center rounded-3xl text-[40px] leading-none ${comingSoonToneClass(tone)}`}
      >
        {icon}
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
        {badge}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
