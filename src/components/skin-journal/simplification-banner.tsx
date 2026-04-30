"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import {
  useAcknowledgeSimplification,
  useActiveSimplification,
} from "@/hooks/use-skin-journal";

export function SimplificationBanner() {
  const t = useTranslations("journal.simplification");
  const locale = useLocale();
  const router = useRouter();
  const { data } = useActiveSimplification();
  const acknowledge = useAcknowledgeSimplification();

  if (!data) return null;

  const startedDate = data.started_at
    ? formatJournalShortDate(data.started_at.slice(0, 10), locale)
    : "";

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-[color:var(--warning-border)] bg-warning-soft px-3.5 py-3 sm:flex-row sm:items-center">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color:var(--warning)] text-white">
        <AlertTriangle className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">
          {t("bannerTitle")}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {t("bannerBody", { date: startedDate })}
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={() => router.push(`/journal/simplification/${data.id}`)}
        >
          {t("viewDetails")}
        </Button>
        <Button
          size="sm"
          className="flex-1 sm:flex-none"
          disabled={acknowledge.isPending}
          onClick={() => acknowledge.mutate(data.id)}
        >
          {acknowledge.isPending ? (
            <LoadingIndicator size="sm" label={t("restoreRoutine")} />
          ) : (
            t("restoreRoutine")
          )}
        </Button>
      </div>
    </div>
  );
}

export function CompactSimplificationAlert() {
  const t = useTranslations("journal.simplification");
  const locale = useLocale();
  const router = useRouter();
  const { data } = useActiveSimplification();

  if (!data) return null;

  const startedDate = formatJournalShortDate(
    data.started_at?.slice(0, 10),
    locale,
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--warning-border)] bg-warning-soft px-3.5 py-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--warning)] text-white">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">
          {t("compactAlert")}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {t("compactAlertSubtitle", { date: startedDate })}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/journal/simplification/${data.id}`)}
      >
        {t("viewInJournal")}
      </Button>
    </div>
  );
}
