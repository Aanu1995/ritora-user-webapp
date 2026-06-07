"use client";

import { DaySummaryPills } from "@/components/today-suggestion/day-summary-pills";
import { ReactionBanner } from "@/components/today-suggestion/reaction-banner";
import { RecordingReminderBanner } from "@/components/today-suggestion/recording-reminder-banner";
import { RoutineBreakBanner } from "@/components/today-suggestion/routine-break-banner";
import { TodayAiConsentCard } from "@/components/today-suggestion/today-ai-consent-card";
import type {
  TodaysSuggestionResponse,
  TodaysSuggestionSlot,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

type TodayStatusStackProps = {
  data: TodaysSuggestionResponse;
  isResettingReaction: boolean;
  resetReactionDisabled: boolean;
  aiConsentMissing: boolean;
  isGrantingAiConsent: boolean;
  userTimeZone: string;
  onGrantAiConsentForScheduled: () => void;
  onRecord: (slot: TodaysSuggestionSlot) => void;
  onResetToNormalRoutine: () => void;
  onResumeRoutineBreak: () => void;
  onUpdateRoutineBreak: (payload: UpdateRoutineBreakPayload) => void;
  routineBreakIsResuming: boolean;
  routineBreakIsUpdating: boolean;
};

export function TodayStatusStack({
  data,
  isResettingReaction,
  resetReactionDisabled,
  aiConsentMissing,
  isGrantingAiConsent,
  userTimeZone,
  onGrantAiConsentForScheduled,
  onRecord,
  onResetToNormalRoutine,
  onResumeRoutineBreak,
  onUpdateRoutineBreak,
  routineBreakIsResuming,
  routineBreakIsUpdating,
}: TodayStatusStackProps) {
  const routineBreak = data.routineBreak;

  return (
    <>
      {routineBreak ? (
        <RoutineBreakBanner
          key={`${routineBreak.id}:${routineBreak.endsAt ?? "none"}`}
          routineBreak={routineBreak}
          isResuming={routineBreakIsResuming}
          isUpdating={routineBreakIsUpdating}
          onResume={onResumeRoutineBreak}
          onUpdateEndsAt={onUpdateRoutineBreak}
        />
      ) : null}

      {data.reactionAlert ? (
        <ReactionBanner
          alert={data.reactionAlert}
          isResetting={isResettingReaction}
          resetDisabled={resetReactionDisabled}
          onResetToNormalRoutine={
            data.reactionAlert.canUseNormalRoutine
              ? onResetToNormalRoutine
              : undefined
          }
        />
      ) : null}

      {routineBreak ? null : (
        <RecordingReminderBanner slots={data.slots} onRecord={onRecord} />
      )}

      <TodayAiConsentCard
        visible={aiConsentMissing && data.slots.length > 0 && !routineBreak}
        pending={isGrantingAiConsent}
        disabled={resetReactionDisabled}
        onGrant={onGrantAiConsentForScheduled}
      />

      <DaySummaryPills data={data} timeZone={userTimeZone} />
    </>
  );
}
