import {
  AlertTriangle,
  CircleDot,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import type { CommunityOutcomeSignal } from "@/types/community";

type SignalTone = "accent" | "ai" | "muted" | "danger" | "warning";

export const PRIMARY_SIGNALS = [
  "worked_for_me_too",
  "worked_with_changes",
  "mixed_result",
  "did_not_work",
  "caused_irritation",
] as const;

export type PrimaryCommunityOutcomeSignal = (typeof PRIMARY_SIGNALS)[number];

export const SIGNAL_META: Record<
  PrimaryCommunityOutcomeSignal,
  { Icon: LucideIcon; tone: SignalTone }
> = {
  worked_for_me_too: { Icon: ThumbsUp, tone: "accent" },
  worked_with_changes: { Icon: Sparkles, tone: "ai" },
  mixed_result: { Icon: CircleDot, tone: "muted" },
  did_not_work: { Icon: ThumbsDown, tone: "danger" },
  caused_irritation: { Icon: AlertTriangle, tone: "warning" },
};

export const SIGNAL_ICON_CLASS: Record<SignalTone, string> = {
  accent: "bg-accent-soft text-accent-strong",
  ai: "bg-ai-bg text-ai-fg",
  muted: "bg-surface-muted text-muted",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

export const SIGNAL_PILL_CLASS: Record<SignalTone, string> = {
  accent:
    "border-accent/20 bg-accent-soft/30 hover:border-accent/40 hover:bg-accent-soft/60",
  ai: "border-ai-border/40 bg-ai-bg/40 hover:border-ai-border hover:bg-ai-bg/70",
  muted:
    "border-border bg-surface-muted/50 hover:border-border-strong hover:bg-surface-muted",
  danger:
    "border-danger/20 bg-danger-soft/30 hover:border-danger/40 hover:bg-danger-soft/60",
  warning:
    "border-warning/20 bg-warning-soft/30 hover:border-warning/40 hover:bg-warning-soft/60",
};

export function isPrimarySignal(
  value: CommunityOutcomeSignal | null,
): value is PrimaryCommunityOutcomeSignal {
  return (
    value !== null && (PRIMARY_SIGNALS as readonly string[]).includes(value)
  );
}
