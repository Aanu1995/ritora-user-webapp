"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { safeDynamicTranslation } from "./safe-translation";
import { formatJournalLongDate } from "./journal-date";
import type {
  JournalEntry,
  PhotoReferenceQualityStatus,
} from "@/types/skin-journal";

interface PhotoReferenceQualityBadgeProps {
  entry: JournalEntry;
}

const STATUS_VARIANTS: Record<
  PhotoReferenceQualityStatus,
  {
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  good_reference: {
    icon: CheckCircle2,
    className: "border-accent bg-accent-soft text-accent-strong",
  },
  limited_reference: {
    icon: TriangleAlert,
    className:
      "border-[color:var(--warning-border)] bg-warning-soft text-[color:var(--warning)]",
  },
  not_trend_safe: {
    icon: Info,
    className: "border-border bg-surface-muted text-muted",
  },
};

export function PhotoReferenceQualityBadge({
  entry,
}: PhotoReferenceQualityBadgeProps) {
  const t = useTranslations("journal.referenceQuality");
  const locale = useLocale();
  const quality = entry.photo_reference_quality ?? {
    status: "not_trend_safe" as const,
    reasons: ["analysis_unavailable" as const],
    quality_score: null,
  };
  const status = quality.status;
  const variant = STATUS_VARIANTS[status];
  const StatusIcon = variant.icon;
  const reason = quality.reasons[0] ?? null;
  const comparedWith = entry.analysis_reference
    ? formatJournalLongDate(entry.analysis_reference.entry_date, locale)
    : null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${variant.className}`}
    >
      <span className="inline-flex items-center gap-1 font-bold">
        <StatusIcon className="h-3.5 w-3.5" />
        {t(`status.${status}`)}
      </span>
      {comparedWith ? (
        <span className="text-current/80">
          {t("comparedWith", { date: comparedWith })}
        </span>
      ) : null}
      {reason ? (
        <span className="text-current/80">
          {safeDynamicTranslation(
            t,
            `reason.${reason}`,
            reason.replace(/_/g, " "),
          )}
        </span>
      ) : null}
    </div>
  );
}
