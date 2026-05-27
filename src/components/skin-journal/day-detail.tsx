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
import { DayDetailPhotoSet } from "./day-detail-photo-set";
import {
  type DayDetailAnalysisFeedbackPayload,
  useDayDetailAnalysisFeedback,
} from "./day-detail-analysis-feedback";
import { JournalDayDetailSkeleton } from "./journal-loading-skeletons";
import { formatJournalShortDate } from "./journal-date";
import { PhotoReferenceQualityBadge } from "./photo-reference-quality-badge";
import {
  CONCERN_KEYS,
  type AnalysisFeedback,
  type AnalysisFailureCode,
  type DayDetail,
  type JournalEntry,
} from "@/types/skin-journal";

interface DayDetailPanelProps {
  detail: DayDetail | null;
  isLoading?: boolean;
  isToday?: boolean;
  onAddPhoto?: () => void;
  onEditEntry?: (entry: JournalEntry) => void;
  photoActionsDisabled?: boolean;
  retryAnalysisDisabled?: boolean;
  onRetryAnalysis?: (entry: JournalEntry) => void;
  analysisFeedbackOverride?: AnalysisFeedback | null;
  analysisFeedbackDisabled?: boolean;
  onAnalysisFeedback?: (
    entry: JournalEntry,
    feedback: DayDetailAnalysisFeedbackPayload,
  ) => void;
  reinterpretAnalysisDisabled?: boolean;
  onReinterpretAnalysis?: (entry: JournalEntry) => void;
  onReplacePhoto?: (entry: JournalEntry) => void;
}

const ANALYSIS_FAILURE_BODY_KEYS: Partial<Record<AnalysisFailureCode, string>> =
  {
    provider_unavailable: "analysisFailedProviderUnavailable",
    provider_rate_limited: "analysisFailedProviderUnavailable",
    provider_timeout: "analysisFailedProviderTimeout",
    provider_invalid_response: "analysisFailedProviderInvalidResponse",
    photo_preflight_rejected: "analysisFailedPhotoPreflight",
    payload_too_large: "analysisFailedPayloadTooLarge",
    cost_limit_exceeded: "analysisFailedCostLimit",
    configuration_error: "analysisFailedConfiguration",
    invalid_photo_input: "analysisFailedInvalidPhoto",
    unknown: "analysisFailedBody",
  };

function analysisFailedBodyKey(code: AnalysisFailureCode | null): string {
  if (!code) return "analysisFailedBody";
  return ANALYSIS_FAILURE_BODY_KEYS[code] ?? "analysisFailedBody";
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
  photoActionsDisabled = false,
  retryAnalysisDisabled = false,
  onRetryAnalysis,
  analysisFeedbackOverride,
  analysisFeedbackDisabled = false,
  onAnalysisFeedback,
  reinterpretAnalysisDisabled = false,
  onReinterpretAnalysis,
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
  const analysisFeedback = useDayDetailAnalysisFeedback(
    entry,
    analysisFeedbackOverride,
  );
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
      <div className="flex flex-col rounded-2xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-6 lg:h-full">
        <div>
          <p className="text-sm text-muted">
            {t("meta", {
              weekday: weekdayShort(date, locale),
              date: formatDayDetailDate(date, locale),
            })}
          </p>
          <h3 className="font-display text-base font-bold">{t("noEntry")}</h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Camera className="h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold">
            {canModifyEntry ? t("noEntryBody") : t("lockedNoEntryBody")}
          </p>
          {canModifyEntry && onAddPhoto ? (
            <Button
              size="sm"
              className="mt-4"
              disabled={photoActionsDisabled}
              onClick={onAddPhoto}
            >
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
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
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

      {entry.has_photo ? <PhotoReferenceQualityBadge entry={entry} /> : null}

      {entry.has_photo ? (
        <DayDetailPhotoSet entry={entry} date={date} />
      ) : (
        <div className="rounded-2xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-5 text-center">
          <Camera className="mx-auto h-9 w-9 text-muted" />
          <p className="mt-2 text-sm font-semibold">{t("noPhotoTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("noPhotoBody")}</p>
          {canModifyEntry && onReplacePhoto ? (
            <Button
              size="sm"
              className="mt-4"
              disabled={photoActionsDisabled}
              onClick={() => onReplacePhoto(entry)}
            >
              {t("addPhotoForDay")}
            </Button>
          ) : null}
        </div>
      )}

      {entry.analysis_observations ? (
        <AnalysisCard
          key={entry.id}
          observations={entry.analysis_observations}
          interpretation={entry.analysis_interpretation}
          feedbackVote={analysisFeedback.visibleFeedback?.vote ?? null}
          feedbackReason={analysisFeedback.visibleFeedback?.reason ?? null}
          feedbackNote={analysisFeedback.visibleFeedback?.note ?? null}
          feedbackDisabled={analysisFeedbackDisabled}
          onFeedback={
            onAnalysisFeedback && !analysisFeedback.hasSubmittedFeedback
              ? (feedback) =>
                  onAnalysisFeedback(entry, {
                    ...feedback,
                  })
              : undefined
          }
          reinterpretDisabled={reinterpretAnalysisDisabled}
          onReinterpret={
            onReinterpretAnalysis
              ? () => onReinterpretAnalysis(entry)
              : undefined
          }
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
                {tErrors(analysisFailedBodyKey(entry.analysis_error_code))}
              </p>
            </div>
          </div>
          {canModifyEntry && onRetryAnalysis ? (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={retryAnalysisDisabled}
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
              <p className="mb-1 text-sm text-muted">{t("ratingsRecorded")}</p>
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
