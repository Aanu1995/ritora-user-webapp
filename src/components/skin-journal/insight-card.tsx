"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, Link2, Sprout, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JournalInsight } from "@/types/skin-journal";

interface InsightCardProps {
  insight: JournalInsight;
  onDismiss?: () => void;
  onShowHow?: () => void;
}

const KIND_STYLES: Record<
  JournalInsight["kind"],
  { borderLeft: string; Icon: typeof TrendingUp; cardBg: string }
> = {
  trend: {
    borderLeft: "border-l-4 border-l-accent",
    Icon: TrendingUp,
    cardBg: "bg-surface",
  },
  correlation: {
    borderLeft: "border-l-4 border-l-[color:var(--ai-strong)]",
    Icon: Link2,
    cardBg: "bg-surface",
  },
  effectiveness: {
    borderLeft: "border-l-4 border-l-[color:var(--secondary)]",
    Icon: Sprout,
    cardBg: "bg-surface",
  },
  referral: {
    borderLeft: "border-l-4 border-l-[color:var(--warning)]",
    Icon: Stethoscope,
    cardBg: "bg-warning-soft",
  },
  daily: {
    borderLeft: "border-l-4 border-l-accent",
    Icon: TrendingUp,
    cardBg: "bg-surface",
  },
  weekly: {
    borderLeft: "border-l-4 border-l-accent",
    Icon: TrendingUp,
    cardBg: "bg-surface",
  },
  monthly: {
    borderLeft: "border-l-4 border-l-accent",
    Icon: TrendingUp,
    cardBg: "bg-surface",
  },
  reaction_recovery: {
    borderLeft: "border-l-4 border-l-[color:var(--secondary)]",
    Icon: Sprout,
    cardBg: "bg-surface",
  },
};

export function InsightCard({
  insight,
  onDismiss,
  onShowHow,
}: InsightCardProps) {
  const t = useTranslations("journal.insightsTab");
  const [expanded, setExpanded] = useState(false);
  const styles = KIND_STYLES[insight.kind];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-4",
        styles.borderLeft,
        styles.cardBg,
      )}
    >
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted">
        <styles.Icon className="h-3 w-3" />
        {t(`kinds.${insight.kind}`)}
      </span>
      <p className="mt-1.5 text-sm font-bold leading-relaxed">
        {insight.summary}
      </p>
      {expanded && insight.supporting_data ? (
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-surface-muted p-2.5 text-[11px] leading-relaxed text-muted">
          {JSON.stringify(insight.supporting_data, null, 2)}
        </pre>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {insight.supporting_data ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExpanded((prev) => !prev);
              onShowHow?.();
            }}
          >
            {t("showHow")}
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            {t("dismiss")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
