"use client";

import { Bell, CircleSlash, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useRecordApplication } from "@/hooks/use-application-tracking";
import { useSnoozeRecordingReminder } from "@/hooks/use-suggestions";
import {
  buildLocalDateTimeIso,
  formatSlotTime12h,
} from "@/lib/suggestion-daypart";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slots: TodaysSuggestionSlot[];
  onRecord: (slot: TodaysSuggestionSlot) => void;
};

export function RecordingReminderBanner({ slots, onRecord }: Props) {
  const t = useTranslations("todaysSuggestion.reminderBanner");
  const recordMutation = useRecordApplication();
  const snoozeMutation = useSnoozeRecordingReminder();
  const now = Date.now();
  const slot = slots.find(
    (candidate) =>
      candidate.suggestion &&
      !candidate.recording &&
      isSnoozeExpired(candidate.recordingReminderSnoozedUntil, now) &&
      (candidate.status === "recordable" || candidate.status === "missed"),
  );

  if (!slot?.suggestion) return null;
  const suggestion = slot.suggestion;

  const skippedPayload = {
    suggestionInstanceId: suggestion.id,
    slotId: slot.slotId,
    targetDate: suggestion.targetDate,
    targetTime: suggestion.targetTime,
    appliedAt: buildLocalDateTimeIso(
      suggestion.targetDate,
      suggestion.targetTime.slice(0, 5),
    ),
    generalNotes: t("skippedNote"),
    items: suggestion.steps.map((step) => ({
      stepOrder: step.stepOrder,
      suggestionStepId: step.id,
      inventoryProductId: step.inventoryProductId,
      productBrand: step.product?.brand ?? step.productBrand,
      productName: step.product?.name ?? step.productName,
      stepLabel: step.stepLabel,
      status: "skipped" as const,
      isAdHoc: false,
      notes: t("skippedItemNote"),
    })),
  };

  return (
    <div className="mb-4 rounded-3xl border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-[color:var(--note-cool-fg)]">
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t("title", { time: formatSlotTime12h(slot.slotTime) })}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted">
            {t("body")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onRecord(slot)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Check className="h-3.5 w-3.5" />
              {t("recordNow")}
            </button>
            <button
              type="button"
              disabled={recordMutation.isPending}
              onClick={() => recordMutation.mutate(skippedPayload)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-60"
            >
              {recordMutation.isPending ? (
                <LoadingIndicator size="sm" />
              ) : (
                <CircleSlash className="h-3.5 w-3.5" />
              )}
              {t("skippedToday")}
            </button>
            <button
              type="button"
              disabled={snoozeMutation.isPending}
              onClick={() =>
                snoozeMutation.mutate({
                  suggestionInstanceId: suggestion.id,
                  minutes: 60,
                })
              }
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface"
            >
              {snoozeMutation.isPending ? (
                <LoadingIndicator size="sm" />
              ) : (
                t("remindLater")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isSnoozeExpired(value: string | null, now: number): boolean {
  if (!value) return true;
  const timestamp = new Date(value).getTime();
  return !Number.isFinite(timestamp) || timestamp <= now;
}
