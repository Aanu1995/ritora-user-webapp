import type { TodaysSuggestionSlot } from "@/types/suggestions";

export function regenerateSimplifiedSuggestions(
  slots: TodaysSuggestionSlot[],
  regenerate: (id: string) => void,
): void {
  slots.forEach((slot) => {
    if (slot.suggestion?.simplifiedForReaction) regenerate(slot.suggestion.id);
  });
}
