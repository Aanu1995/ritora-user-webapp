import { KeyRound, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SuggestionMode } from "@/types/suggestions";

export function SuggestionModeBadge({ mode }: { mode: SuggestionMode }) {
  const t = useTranslations("todaysSuggestion.modeBadge");

  if (mode === "ai") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
          "text-[10.5px] font-semibold uppercase tracking-wide",
          "border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]",
        )}
      >
        <Sparkles className="h-3 w-3" />
        {t("ai")}
      </span>
    );
  }

  if (mode === "mixed") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
          "text-[10.5px] font-semibold uppercase tracking-wide",
          "border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] text-[color:var(--ai-fg)]",
        )}
      >
        <Sparkles className="h-3 w-3" />
        {t("mixed")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[10.5px] font-semibold uppercase tracking-wide",
        "border-border bg-surface-muted text-muted",
      )}
    >
      {t("manual")}
    </span>
  );
}

export type SuggestionStatusPillVariant =
  | "ready"
  | "applied"
  | "edited"
  | "skipped"
  | "locked"
  | "awaiting"
  | "simplified"
  | "specialist";

export function SuggestionStatusPill({
  variant,
  icon,
  children,
}: {
  variant: SuggestionStatusPillVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[10.5px] font-semibold uppercase tracking-wide",
        STATUS_VARIANT_CLASSES[variant],
      )}
    >
      {icon ? <span className="inline-flex h-3 w-3">{icon}</span> : null}
      {children}
    </span>
  );
}

const STATUS_VARIANT_CLASSES: Record<SuggestionStatusPillVariant, string> = {
  ready:
    "border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]",
  applied:
    "border-[color:rgba(47,122,82,0.32)] bg-accent-soft text-accent-strong",
  edited:
    "border-[color:rgba(184,84,10,0.3)] bg-warning-soft text-[color:var(--note-warm-fg)]",
  skipped: "border-border bg-surface-muted text-muted",
  locked: "border-border bg-surface-muted text-muted",
  awaiting:
    "border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]",
  simplified:
    "border-[color:rgba(179,38,30,0.3)] bg-danger-soft text-[color:var(--danger)]",
  specialist:
    "border-[color:rgba(47,122,82,0.32)] bg-accent-soft text-accent-strong",
};

export function SuggestionProvenanceChip({
  provenance,
}: {
  provenance: "specialist_locked" | "user_routine" | "ai_added";
}) {
  const t = useTranslations("todaysSuggestion.provenance");

  if (provenance === "specialist_locked") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
          "text-[10.5px] font-semibold",
          "border-[color:rgba(47,122,82,0.32)] bg-accent-soft text-accent-strong",
        )}
      >
        <KeyRound className="h-2.5 w-2.5" />
        {t("specialistLocked")}
      </span>
    );
  }

  if (provenance === "ai_added") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
          "text-[10.5px] font-semibold",
          "border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]",
        )}
      >
        <Sparkles className="h-2.5 w-2.5" />
        {t("aiAdded")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[10.5px] font-medium",
        "border-border bg-surface text-muted",
      )}
    >
      {t("yourRoutine")}
    </span>
  );
}
