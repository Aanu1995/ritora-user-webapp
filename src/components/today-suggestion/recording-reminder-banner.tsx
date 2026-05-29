"use client";

import { Bell, CircleSlash, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { buildSkippedApplicationPayload } from "@/components/today-suggestion/record-application-payload";
import { useRecordApplication } from "@/hooks/use-application-tracking";
import { useSnoozeRecordingReminder } from "@/hooks/use-suggestions";
import { formatSlotTime12h } from "@/lib/suggestion-daypart";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slots: TodaysSuggestionSlot[];
  onRecord: (slot: TodaysSuggestionSlot) => void;
};

export function RecordingReminderBanner({ slots, onRecord }: Props) {
  const t = useTranslations("todaysSuggestion.reminderBanner");
  const recordMutation = useRecordApplication();
  const snoozeMutation = useSnoozeRecordingReminder();
  const slot = slots.find(
    (candidate) =>
      candidate.suggestion &&
      candidate.suggestion.steps.length > 0 &&
      !candidate.recording &&
      candidate.recordingReminderSnoozedUntil === null &&
      (candidate.status === "recordable" || candidate.status === "missed"),
  );

  if (!slot?.suggestion) return null;
  const suggestion = slot.suggestion;
  const skippedPayload = buildSkippedApplicationPayload(
    slot,
    t("skippedNote"),
    t("skippedItemNote"),
  );

  return (
    <div className="mb-4 rounded-3xl border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-[color:var(--note-cool-fg)]"
        >
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t("title", { time: formatSlotTime12h(slot.slotTime) })}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted">{t("body")}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 sm:pl-12">
        <Button
          type="button"
          size="sm"
          onClick={() => onRecord(slot)}
          className="bg-[color:var(--accent)] text-white shadow-none hover:bg-[color:var(--accent-strong)] hover:opacity-100"
        >
          <Check className="h-3.5 w-3.5" />
          {t("recordNow")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={recordMutation.isPending}
          onClick={() => {
            if (skippedPayload) recordMutation.mutate(skippedPayload);
          }}
        >
          {recordMutation.isPending ? (
            <LoadingIndicator size="sm" />
          ) : (
            <CircleSlash className="h-3.5 w-3.5" />
          )}
          {t("skippedToday")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={snoozeMutation.isPending}
          onClick={() =>
            snoozeMutation.mutate({
              suggestionInstanceId: suggestion.id,
              minutes: 60,
            })
          }
          className="text-muted"
        >
          {snoozeMutation.isPending ? (
            <LoadingIndicator size="sm" />
          ) : (
            t("remindLater")
          )}
        </Button>
      </div>
    </div>
  );
}
