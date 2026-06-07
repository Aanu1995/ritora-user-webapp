import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightLeft,
  Check,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SafetyChip } from "./community-shared";

export type ChangeKind = "kept" | "swapped" | "removed" | "gap";

export const changeMeta: Record<
  ChangeKind,
  {
    Icon: LucideIcon;
    labelKey: string;
    accent: string;
    badge: "accent" | "ai" | "warning" | "muted";
  }
> = {
  kept: {
    Icon: Check,
    labelKey: "change.kept",
    accent: "border-accent/30 bg-accent-soft",
    badge: "accent",
  },
  swapped: {
    Icon: ArrowRightLeft,
    labelKey: "change.swapped",
    accent: "border-ai-border bg-ai-soft",
    badge: "ai",
  },
  removed: {
    Icon: X,
    labelKey: "change.removed",
    accent: "border-warning/30 bg-warning-soft",
    badge: "warning",
  },
  gap: {
    Icon: Info,
    labelKey: "change.gap",
    accent: "border-border-strong bg-surface-muted/60",
    badge: "muted",
  },
};

export const summaryLabels: Record<
  string,
  { labelKey: string; kind: ChangeKind }
> = {
  matched: { labelKey: "summary.kept", kind: "kept" },
  kept: { labelKey: "summary.kept", kind: "kept" },
  swapped: { labelKey: "summary.swapped", kind: "swapped" },
  substituted: { labelKey: "summary.swapped", kind: "swapped" },
  removed: { labelKey: "summary.removed", kind: "removed" },
  blocked: { labelKey: "summary.removed", kind: "removed" },
  gaps: { labelKey: "summary.gaps", kind: "gap" },
  gap: { labelKey: "summary.gaps", kind: "gap" },
};

export function resolveChange(value: string): ChangeKind {
  const normalised = value.toLowerCase();
  if (normalised.includes("kept") || normalised.includes("match"))
    return "kept";
  if (normalised.includes("swap") || normalised.includes("substitut"))
    return "swapped";
  if (normalised.includes("remov") || normalised.includes("block"))
    return "removed";
  if (normalised.includes("gap") || normalised.includes("missing"))
    return "gap";
  return "kept";
}

export function SafetyBanner({
  children,
  severity,
}: {
  children: ReactNode;
  severity: "info" | "low" | "medium" | "high";
}) {
  const high = severity === "high";
  const t = useTranslations("community.routineDetail.safetySeverity");
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm leading-5",
        high
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-warning/30 bg-warning-soft text-warning",
      )}
      role="alert"
    >
      <SafetyChip severity={severity}>
        {high ? t("high") : severity === "info" ? t("note") : t("watch")}
      </SafetyChip>
      <span className="flex-1 text-foreground">{children}</span>
    </div>
  );
}
