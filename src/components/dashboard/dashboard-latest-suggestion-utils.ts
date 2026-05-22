import type {
  SuggestionDaypart,
  TodaysSuggestionResponse,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

const DAYPART_ORDER: Record<SuggestionDaypart, number> = {
  morning: 0,
  noon: 1,
  evening: 2,
};

/**
 * Pick the single "latest actionable" slot to promote to the dashboard.
 *
 * Rules (per product requirements):
 *  - Only consider slots that are visible AND whose suggestion has finished
 *    generating (status "ready") — never show a half-baked plan on the
 *    dashboard.
 *  - Eligible statuses: "ready", "active", "recordable". Skip anything the
 *    user has already recorded (status "recorded" or "edited"), anything
 *    that has slipped past its window ("missed"), anything still locked or
 *    being generated, and anything that failed.
 *  - Skip slots whose recording is already saved server-side — that's the
 *    "do not show once it has been recorded" rule from the spec.
 *  - When multiple slots qualify (e.g. morning is recordable AND noon is
 *    ready), prefer the one earlier in the day, then earlier in the slot
 *    time. The user records in order.
 *  - When none qualify, return null and the dashboard hides the section.
 */
export function pickDashboardLatestSlot(
  response: TodaysSuggestionResponse | undefined,
): TodaysSuggestionSlot | null {
  if (!response) return null;

  const eligible = response.slots.filter(isDashboardActionable);
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
