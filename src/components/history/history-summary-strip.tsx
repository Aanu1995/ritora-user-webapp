"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

type HistorySummaryStripProps = {
  adherencePercent: number | null;
  applied: number;
  edited: number;
  total: number;
};

export function HistorySummaryStrip({
  adherencePercent,
  applied,
  edited,
  total,
}: HistorySummaryStripProps) {
  const t = useTranslations("history.summary");
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:rgba(47,122,82,0.28)] bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
        {t("appliedOf", { applied, total })}
      </span>
      {edited > 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)] px-2.5 py-1 text-xs font-medium text-[color:var(--note-warm-fg)]">
          <Pencil className="h-3 w-3" />
          {t("edited", { count: edited })}
        </span>
      ) : null}
      {adherencePercent !== null ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
          {t("adherence", { percent: adherencePercent })}
        </span>
      ) : null}
    </div>
  );
}
