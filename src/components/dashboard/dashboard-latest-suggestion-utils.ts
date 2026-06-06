import type {
  SuggestionDaypart,
  TodaysSuggestionResponse,
  TodaysSuggestionSlot,
} from "@/types/suggestions";
import { onDemandToSlot } from "@/components/today-suggestion/on-demand-suggestion-adapter";

const DAYPART_ORDER: Record<SuggestionDaypart, number> = {
  morning: 0,
  noon: 1,
  evening: 2,
};

export function pickDashboardLatestSlot(
  response: TodaysSuggestionResponse | undefined,
): TodaysSuggestionSlot | null {
  if (!response) return null;

  const onDemandSlots = (response.onDemandSuggestions ?? []).map(
    onDemandToSlot,
  );
  const eligible = [...response.slots, ...onDemandSlots].filter(
    isDashboardActionable,
  );
  if (eligible.length === 0) return null;

  return eligible.reduce((earliest, slot) =>
    compareSlotsForDashboard(slot, earliest) < 0 ? slot : earliest,
  );
}

function isDashboardActionable(slot: TodaysSuggestionSlot): boolean {
  if (!slot.isVisible) return false;
  if (slot.recording) return false;
  if (slot.applicationLog) return false;
  if (!slot.suggestion) return false;
  if (slot.suggestion.generationStatus !== "ready") return false;
  if (slot.suggestion.applicationLogId) return false;
  return (
    slot.status === "ready" ||
    slot.status === "active" ||
    slot.status === "recordable"
  );
}

function compareSlotsForDashboard(
  a: TodaysSuggestionSlot,
  b: TodaysSuggestionSlot,
): number {
  const daypartDelta = DAYPART_ORDER[a.daypart] - DAYPART_ORDER[b.daypart];
  if (daypartDelta !== 0) return daypartDelta;
  return a.slotTime.localeCompare(b.slotTime);
}
