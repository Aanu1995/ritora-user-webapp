"use client";

import { useLocale, useTranslations } from "next-intl";
import type { JournalStats } from "@/types/skin-journal";

function formatShortDate(ymd: string, locale: string): string {
  const [y, m, d] = ymd.split("-").map((s) => Number.parseInt(s, 10));
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

interface StatStripProps {
  stats?: JournalStats;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3.5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-[22px] font-bold leading-none tracking-tight">
        {value}
      </p>
      {trend ? (
        <p className="mt-0.5 text-[11px] text-accent-strong">{trend}</p>
      ) : null}
    </div>
  );
}

export function StatStrip({ stats, isLoading }: StatStripProps) {
  const t = useTranslations("journal.stats");
  const locale = useLocale();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-3 gap-3" aria-label={t("loadingLabel")}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface px-3.5 py-3"
          >
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface-muted" />
            <div className="mt-2 h-6 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="mt-1.5 h-2.5 w-16 animate-pulse rounded-full bg-surface-muted" />
          </div>
        ))}
      </div>
    );
  }

  const streakDelta = Math.min(stats.current_streak, 7);
  const streakTrend =
    streakDelta > 0 ? t("streakDelta", { count: streakDelta }) : undefined;
  const sinceTrend = stats.first_entry_date
    ? t("sinceDate", {
        date: formatShortDate(stats.first_entry_date, locale),
      })
    : undefined;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label={t("currentStreak")}
        value={t("currentStreakValue", { days: stats.current_streak })}
        trend={streakTrend}
      />
      <StatCard
        label={t("totalEntries")}
        value={String(stats.total_entries)}
        trend={sinceTrend}
      />
      <StatCard
        label={t("weeklyUploadRate")}
        value={`${stats.weekly_upload_rate}%`}
        trend={t("weeklyUploadValue", {
          count: stats.weekly_uploads,
          target: stats.weekly_target,
        })}
      />
    </div>
  );
}
