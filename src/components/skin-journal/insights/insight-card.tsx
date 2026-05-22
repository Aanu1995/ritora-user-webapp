"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InsightBlockView } from "@/components/skin-journal/insights/insight-block-view";
import { resolveInsightText } from "@/components/skin-journal/insights/insight-text";
import { WhyThisModal } from "./why-this-modal";
import type {
  InsightAction,
  JournalInsight,
} from "@/types/skin-journal";

interface InsightCardProps {
  insight: JournalInsight;
  isActionDisabled?: (action: InsightAction) => boolean;
  onAction?: (action: InsightAction) => void;
  onDismiss?: () => void;
}

function formatDate(locale: string, date: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function insightActionLabel(action: InsightAction): string {
  if (action.kind === "view_entries") return "actions.viewEntries";
  if (action.kind === "open_compare") return "actions.openCompare";
  if (action.kind === "open_export") return "actions.openExport";
  if (action.kind === "open_product") return "actions.openProduct";
  if (action.kind === "open_today_upload") return "actions.openTodayUpload";
  if (action.kind === "open_settings") return "actions.openSettings";
  return "dismiss";
}

export function InsightCard({
  insight,
  isActionDisabled,
  onAction,
  onDismiss,
}: InsightCardProps) {
  const t = useTranslations("journal.insightsTab");
  const tConcerns = useTranslations("journal.concerns");
  const locale = useLocale();
  const [whyOpen, setWhyOpen] = useState(false);
  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(insight.generated_at)),
    [insight.generated_at, locale],
  );
  const isAi = insight.metadata.source !== "deterministic";

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-surface p-4",
        insight.severity === "critical" && "border-danger bg-danger-soft/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted">
        {insight.severity === "critical" ? (
          <AlertTriangle className="h-3.5 w-3.5 text-danger" />
        ) : (
          <TrendingUp className="h-3.5 w-3.5" />
        )}
        <span>{t(`kinds.${insight.kind}`)}</span>
        <span>·</span>
        <span>{t(`severity.${insight.severity}`)}</span>
        {isAi ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ai-bg)] px-2 py-0.5 text-[color:var(--ai-fg)]">
            <Sparkles className="h-3 w-3" />
            {t(
              insight.metadata.source === "ai_sourced"
                ? "ai.chipStrong"
                : "ai.chip",
            )}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-base font-semibold leading-relaxed">
        {resolveInsightText(t, tConcerns, insight.headline)}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {t("generatedLine", { date: generatedAt })} ·{" "}
        {t("basedOnLine", {
          start: formatDate(locale, insight.time_window.start),
          end: formatDate(locale, insight.time_window.end),
        })}
      </p>
      <div className="mt-4 space-y-3">
        {insight.blocks.map((block, index) => (
          <InsightBlockView
            key={`${block.type}-${index}`}
            block={block}
            insight={insight}
            isActionDisabled={isActionDisabled}
            onAction={onAction}
          />
        ))}
      </div>
      {insight.caveats.length > 0 ? (
        <div className="mt-3 space-y-1 text-xs text-muted">
          {insight.caveats.map((caveat) => (
            <p key={caveat.key}>
              {resolveInsightText(t, tConcerns, caveat)}
            </p>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {isAi ? (
          <Button variant="outline" size="sm" onClick={() => setWhyOpen(true)}>
            <HelpCircle className="h-3.5 w-3.5" />
            {t("ai.whyThis")}
          </Button>
        ) : null}
        {insight.actions
          .filter((action) => action.kind !== "dismiss")
          .map((action) => (
            <Button
              key={`${action.kind}-${insightActionLabel(action)}`}
              variant="outline"
              size="sm"
              disabled={isActionDisabled?.(action) ?? false}
              onClick={() => onAction?.(action)}
            >
              {t(insightActionLabel(action))}
            </Button>
          ))}
        {onDismiss ? (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            {t("dismiss")}
          </Button>
        ) : null}
      </div>
      <WhyThisModal
        insight={insight}
        open={whyOpen}
        onOpenChange={setWhyOpen}
      />
    </article>
  );
}
