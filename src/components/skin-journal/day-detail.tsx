"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  Camera,
  PencilLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "./chip";
import { ConcernRatingRow } from "./concern-rating-row";
import { AnalysisCard } from "./analysis-card";
import { PhotoFrame } from "./photo-frame";
import { JournalDayDetailSkeleton } from "./journal-loading-skeletons";
import { formatJournalShortDate } from "./journal-date";
import {
  CONCERN_KEYS,
  type DayDetail,
  type JournalEntry,
} from "@/types/skin-journal";

interface DayDetailPanelProps {
  detail: DayDetail | null;
  isLoading?: boolean;
  isToday?: boolean;
  onAddPhoto?: () => void;
  onEditEntry?: (entry: JournalEntry) => void;
  onRetryAnalysis?: (entry: JournalEntry) => void;
  onReplacePhoto?: (entry: JournalEntry) => void;
}

function weekdayShort(date: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(`${date}T12:00:00Z`),
    );
  } catch {
    return "";
  }
}

function formatDayDetailDate(date: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}

export function DayDetailPanel({
  detail,
  isLoading,
  isToday,
  onAddPhoto,
  onEditEntry,
  onRetryAnalysis,
  onReplacePhoto,
}: DayDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations("journal.dayDetail");
  const tConcerns = useTranslations("journal.concerns");
  const tFeels = useTranslations("journal.feels");
  const tCtx = useTranslations("journal.context");
  const tEvents = useTranslations("journal.events.kinds");
  const tErrors = useTranslations("journal.errors");
  const tSeverity = useTranslations("journal.severity");

  const date = detail?.date ?? "";
  const entry = detail?.entry ?? null;
  const canModifyEntry = isToday === true;

  const ratingsArray = useMemo(() => {
    return CONCERN_KEYS.map((key) => ({
      key,
      label: tConcerns(key),
      value: entry?.ratings?.[key] ?? null,
    }));
  }, [entry, tConcerns]);

  if (isLoading) {
    return <JournalDayDetailSkeleton ariaLabel={t("loadingLabel")} />;
  }

  if (!entry) {
    return (
      <div className="flex flex-col rounded-2xl border border-border bg-surface-muted p-6 lg:h-full">
        <div>
          <p className="text-sm text-muted">
            {t("meta", {
              weekday: weekdayShort(date, locale),
              date: formatDayDetailDate(date, locale),
            })}
          </p>
          <h3 className="font-display text-base font-bold">
            {t("noEntry")}
          </h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Camera className="h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold">
            {canModifyEntry ? t("noEntryBody") : t("lockedNoEntryBody")}
          </p>
          {canModifyEntry && onAddPhoto ? (
            <Button className="mt-4" onClick={onAddPhoto}>
              {t("addPhoto")}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const hasReaction = entry.has_reaction;
  const reactionSeverity =
    entry.analysis_observations?.reaction_signals?.reaction_severity;
  const status = entry.analysis_status;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted">
            {isToday
              ? t("metaToday", {
                  weekday: weekdayShort(date, locale),
                  date: formatDayDetailDate(date, locale),
                })
              : t("meta", {
                  weekday: weekdayShort(date, locale),
                  date: formatDayDetailDate(date, locale),
                })}
          </p>
          <h3 className="mt-0.5 font-display text-base font-bold">
            {isToday
              ? t("todayTitle")
              : t("title", {
                  date: formatJournalShortDate(date, locale),
                })}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasReaction ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--danger-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger">
              <AlertTriangle className="h-3 w-3" />
              {tEvents("reaction_detected")} ·{" "}
              {tSeverity(reactionSeverity ?? "moderate")}
            </span>
          ) : status === "completed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
              <Sparkles className="h-3 w-3" />
              {t("statusCompleted")}
            </span>
          ) : status === "pending" ||
            status === "queued" ||
            status === "running" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--warning)]">
              {t("statusAnalysing")}
            </span>
          ) : status === "failed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--warning)]">
              {t("statusFailed")}
            </span>
          ) : status === "needs_review" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--warning)]">
              {t("statusNeedsReview")}
            </span>
          ) : status === "skipped" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
              {t("noPhotoTag")}
            </span>
          ) : null}
          {canModifyEntry && onEditEntry ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditEntry(entry)}
              className="text-accent-strong hover:bg-accent/5"
            >
              <PencilLine className="h-3.5 w-3.5" />
              {t("editEntry")}
            </Button>
          ) : null}
        </div>
      </div>

      {entry.photo_url ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="mx-auto w-full max-w-md px-4 py-6 sm:px-6 sm:py-8">
            <PhotoFrame
              url={entry.photo_url}
              alt={t("photoAlt", { date })}
              aspect="square"
            />
          </div>
          <div className="mx-auto w-full max-w-md px-4 pb-6 sm:px-6 sm:pb-8">
            <p className="text-xs text-muted">
              {entry.is_pre_routine ? t("preRoutineTag") : t("photoSavedTag")}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface-muted p-5 text-center">
          <Camera className="mx-auto h-9 w-9 text-muted" />
          <p className="mt-2 text-sm font-semibold">{t("noPhotoTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("noPhotoBody")}</p>
          {canModifyEntry && onReplacePhoto ? (
            <Button className="mt-4" onClick={() => onReplacePhoto(entry)}>
              {t("addPhotoForDay")}
            </Button>
          ) : null}
        </div>
      )}

      {entry.analysis_observations ? (
        <AnalysisCard
          observations={entry.analysis_observations}
          interpretation={entry.analysis_interpretation}
        />
      ) : status === "failed" ? (
        <div className="rounded-2xl border border-[color:var(--warning-border)] bg-warning-soft p-4">
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--warning)] text-white">
              !
            </span>
            <div>
              <p className="text-sm font-semibold">
                {tErrors("analysisFailedTitle")}
              </p>
              <p className="text-sm text-muted">
                {tErrors("analysisFailedBody")}
              </p>
            </div>
          </div>
          {canModifyEntry && onRetryAnalysis ? (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetryAnalysis(entry)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("retryAnalysis")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {(entry.ratings || entry.complaint_note || entry.overall_feel) && (
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-sm font-semibold">{t("ratingsTitle")}</p>
          <div className="mt-2 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {entry.overall_feel ? (
              <div>
                <p className="mb-1 text-sm text-muted">{t("feelLabel")}</p>
                <Chip selected variant="accent">
                  {tFeels(entry.overall_feel)}
                </Chip>
              </div>
            ) : null}
            <div>
              <p className="mb-1 text-sm text-muted">{t("contextLabel")}</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.sleep_band ? (
                  <Chip>{tCtx(`sleep_${entry.sleep_band}`)}</Chip>
                ) : null}
                {entry.stress_today ? (
                  <Chip>{tCtx(`stress_${entry.stress_today}`)}</Chip>
                ) : null}
                {entry.sun_exposure_today ? (
                  <Chip>{tCtx(`sun_${entry.sun_exposure_today}`)}</Chip>
                ) : null}
                {entry.sweat_exercise_today !== null &&
                entry.sweat_exercise_today !== undefined ? (
                  <Chip>
                    {entry.sweat_exercise_today
                      ? tCtx("sweat_yes")
                      : tCtx("sweat_no")}
                  </Chip>
                ) : null}
                {entry.cycle_marker ? (
                  <Chip variant="ai" selected>
                    {tCtx(`cycle_${entry.cycle_marker}`)}
                  </Chip>
                ) : null}
              </div>
            </div>
          </div>

          {entry.ratings ? (
            <div className="mt-3">
              <p className="mb-1 text-sm text-muted">
                {t("ratingsRecorded")}
              </p>
              <div className="grid grid-cols-1 gap-1 xl:grid-cols-2">
                {ratingsArray.map((row) => (
                  <ConcernRatingRow
                    key={row.key}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {entry.complaint_note ? (
            <>
              <div className="my-3 h-px bg-border" />
              <p className="mb-1 text-sm text-muted">{t("noteLabel")}</p>
              <p className="m-0 text-sm italic text-foreground">
                &ldquo;{entry.complaint_note}&rdquo;
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
