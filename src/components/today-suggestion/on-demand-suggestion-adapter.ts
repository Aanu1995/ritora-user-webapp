import type {
  TodaysOnDemandSuggestion,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export function onDemandToSlot(
  item: TodaysOnDemandSuggestion,
): TodaysSuggestionSlot {
  const suggestion = item.suggestion;
  return {
    slotId: `on-demand:${suggestion.id}`,
    daypart: suggestion.daypart,
    slotTime: suggestion.targetTime,
    mode: suggestion.mode,
    slotNotes: null,
    routineStepCount: suggestion.steps.length,
    specialistLockedStepCount: 0,
    specialist: null,
    visibleAt: suggestion.visibleAt,
    status: item.status,
    slotStartsAt: suggestion.visibleAt,
    recordableAt: suggestion.visibleAt,
    expiresAt: suggestion.updatedAt,
    recording: item.recording,
    recordingReminderSnoozedUntil: null,
    applicationLog: item.applicationLog,
    isVisible: true,
    suggestion,
  };
}
