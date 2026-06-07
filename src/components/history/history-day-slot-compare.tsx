"use client";

import {
  CheckCheck,
  Check,
  Ellipsis,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HistoryAppliedItemRow } from "@/components/history/history-applied-item-row";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import { SuggestionStepRow } from "@/components/today-suggestion/step-row";
import { SuggestionClimatePills } from "@/components/today-suggestion/suggestion-climate-pills";
import { Button } from "@/components/ui/button";
import { formatSlotTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import type { ApplicationLog } from "@/types/application-tracking";
import type {
  SuggestionHistorySlotSummary,
  SuggestionInstance,
  SuggestionStep,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export function HistoryDaySlotCompare({
  slot,
  date,
  tSummary,
  onEdit,
  onRecord,
  onShowDetail,
  nowMs,
}: {
  slot: SuggestionHistorySlotSummary;
  date: string;
  tSummary: ReturnType<typeof useTranslations>;
  onEdit: (slot: TodaysSuggestionSlot, log: ApplicationLog) => void;
  onRecord?: (slot: TodaysSuggestionSlot) => void;
  onShowDetail?: (suggestion: SuggestionInstance) => void;
  nowMs: number;
}) {
  const t = useTranslations("history.day");
  const tSlot = useTranslations("todaysSuggestion.slot");
  const suggestionSteps = [...(slot.suggestion?.steps ?? [])].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );
  const appliedItems = [...(slot.applicationLog?.items ?? [])].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );
  const hasSuggestionSteps = suggestionSteps.length > 0;
  const applicationLog = slot.applicationLog ?? null;
  const detailSuggestion = slot.suggestion ?? null;
  const actionableSlot = slot.suggestion
    ? toTodaysSlot(date, slot, applicationLog)
    : null;
  const canActOnHistorySlot = actionableSlot
    ? isWithinHistoryRecordWindow(actionableSlot, nowMs)
    : false;
  const canRecordHistorySlot = Boolean(
    hasSuggestionSteps &&
      !applicationLog &&
      actionableSlot &&
      canActOnHistorySlot &&
      onRecord,
  );
  const canEditHistorySlot = Boolean(
    slot.applicationLogId &&
      actionableSlot &&
      applicationLog &&
      canActOnHistorySlot,
  );
  const canShowDetailInFooter = Boolean(
    detailSuggestion && onShowDetail && !canActOnHistorySlot,
  );
  const shouldShowFooter =
    !canActOnHistorySlot || canShowDetailInFooter || canEditHistorySlot;

  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <header className="mb-3 flex items-start gap-3">
        <SuggestionDaypartIcon daypart={slot.daypart} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-foreground">
            {t(`daypart.${slot.daypart}`)}, {formatSlotTime12h(slot.slotTime)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("appliedSummary", {
              applied: slot.appliedCount,
              total: slot.totalSteps,
            })}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <HistoryStatusPills slot={slot} tSummary={tSummary} />
          <SuggestionModeBadge mode={slot.mode} />
        </div>
      </header>

      <SuggestionClimatePills
        environment={slot.suggestion?.environmentSummary ?? null}
      />

      <p className="text-sm leading-snug text-muted">{slot.summaryLine}</p>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <CompareColumn
          label={t("compare.suggested")}
          icon={<Sparkles className="h-3 w-3" />}
        >
          {suggestionSteps.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {suggestionSteps.map((step, index) => (
                <li key={step.id}>
                  <SuggestionStepRow step={step} index={index} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-muted">{t("compare.noSuggested")}</p>
          )}
        </CompareColumn>
        <CompareColumn
          label={t("compare.applied")}
          icon={
            <CheckCheck className="h-3 w-3 text-[color:var(--accent-strong)]" />
          }
          accent
        >
          {appliedItems.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {appliedItems.map((item) => (
                <li key={item.id}>
                  <HistoryAppliedItemRow
                    item={item}
                    fallbackAppliedAt={applicationLog?.appliedAt ?? null}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-muted">{t("compare.noApplied")}</p>
          )}
        </CompareColumn>
      </div>

      {canRecordHistorySlot && actionableSlot && onRecord ? (
        <div className="mt-3.5 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onRecord(actionableSlot)}
            className="flex-1 bg-[color:var(--accent)] text-white shadow-none hover:bg-[color:var(--accent-strong)] hover:opacity-100"
          >
            <Check className="h-4 w-4" />
            {tSlot("recordWhatIApplied")}
          </Button>
          {detailSuggestion && onShowDetail ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onShowDetail(detailSuggestion)}
              className="w-7 shrink-0 px-0 sm:w-9"
              aria-label={t("whyThisRoutine")}
            >
              <Ellipsis className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {shouldShowFooter ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {!canActOnHistorySlot ? (
            <div className="space-y-1">
              <p className="text-xs text-muted">{t("outcomeNote")}</p>
              <p className="text-[11.5px] font-medium text-muted">
                {t("aiSawContext")}
              </p>
            </div>
          ) : null}
          <div className="flex w-full shrink-0 flex-wrap justify-end gap-1.5 sm:ml-auto sm:w-auto">
            {canShowDetailInFooter && detailSuggestion && onShowDetail ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShowDetail(detailSuggestion)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("whyThisRoutine")}
              </Button>
            ) : null}
            {slot.applicationLogId &&
            actionableSlot &&
            applicationLog &&
            canActOnHistorySlot ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(actionableSlot, applicationLog)}
                className="min-w-32 justify-center"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("editRecord")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function HistoryStatusPills({
  slot,
  tSummary,
}: {
  slot: SuggestionHistorySlotSummary;
  tSummary: ReturnType<typeof useTranslations>;
}) {
  if (slot.status === "applied") {
    return (
      <>
        <SuggestionStatusPill variant="applied">
          {tSummary("status.applied")}
        </SuggestionStatusPill>
        {slot.hasBeenEdited ? <EditedPill tSummary={tSummary} /> : null}
      </>
    );
  }
  return (
    <>
      <SuggestionStatusPill
        variant={slot.status === "simplified" ? "simplified" : "skipped"}
      >
        {tSummary(`status.${slot.status}`)}
      </SuggestionStatusPill>
      {slot.hasBeenEdited ? <EditedPill tSummary={tSummary} /> : null}
    </>
  );
}

function EditedPill({
  tSummary,
}: {
  tSummary: ReturnType<typeof useTranslations>;
}) {
  return (
    <SuggestionStatusPill variant="edited">
      <Pencil className="h-3 w-3" />
      {tSummary("status.edited")}
    </SuggestionStatusPill>
  );
}

function CompareColumn({
  label,
  icon,
  accent,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface-muted p-3.5",
        accent ? "border-[color:rgba(47,122,82,0.32)]" : "border-border",
      )}
    >
      <p
        className={cn(
          "mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide",
          accent ? "text-accent-strong" : "text-muted",
        )}
      >
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function toTodaysSlot(
  date: string,
  slot: SuggestionHistorySlotSummary,
  log: ApplicationLog | null,
): TodaysSuggestionSlot | null {
  const suggestion = slot.suggestion;
  if (!suggestion) return null;
  const startsAt = buildLocalIso(date, slot.slotTime);
  return {
    slotId: slot.slotId ?? suggestion.slotId ?? suggestion.id,
    daypart: slot.daypart,
    slotTime: slot.slotTime,
    mode: slot.mode,
    slotNotes: null,
    routineStepCount: slot.totalSteps,
    specialistLockedStepCount: countSpecialistLocked(suggestion.steps),
    specialist: null,
    visibleAt: suggestion.visibleAt,
    status: log ? (log.hasBeenEdited ? "edited" : "recorded") : "recordable",
    slotStartsAt: startsAt,
    recordableAt: startsAt,
    expiresAt: addHoursToLocalIso(startsAt, HISTORY_RECORD_WINDOW_HOURS),
    recording: log
      ? {
          applicationLogId: log.id,
          appliedAt: log.appliedAt,
          hasBeenEdited: log.hasBeenEdited,
          editCount: log.editCount,
          lastEditedAt: log.lastEditedAt,
          appliedCount: slot.appliedCount,
          totalItems: log.items.length,
        }
      : null,
    recordingReminderSnoozedUntil: null,
    applicationLog: log,
    isVisible: true,
    suggestion,
  };
}

function countSpecialistLocked(steps: SuggestionStep[]): number {
  return steps.filter((step) => step.provenance === "specialist_locked").length;
}

function buildLocalIso(date: string, time: string): string {
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

const HISTORY_RECORD_WINDOW_HOURS = 24;

function isWithinHistoryRecordWindow(
  slot: TodaysSuggestionSlot,
  nowMs: number,
): boolean {
  const recordableAtMs = Date.parse(slot.recordableAt);
  const expiresAtMs = Date.parse(slot.expiresAt);
  if (!Number.isFinite(recordableAtMs) || !Number.isFinite(expiresAtMs)) {
    return false;
  }
  return nowMs >= recordableAtMs && nowMs <= expiresAtMs;
}

function addHoursToLocalIso(value: string, hours: number): string {
  const date = new Date(Date.parse(value));
  date.setHours(date.getHours() + hours);
  return [
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-"),
    [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0"),
    ].join(":"),
  ].join("T");
}
