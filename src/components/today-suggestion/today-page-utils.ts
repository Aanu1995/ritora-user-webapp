import type {
  SuggestionDaypart,
  SuggestionGapRecommendation,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export function groupSlotsByDaypart(slots: TodaysSuggestionSlot[]) {
  const grouped: Record<SuggestionDaypart, TodaysSuggestionSlot[]> = {
    morning: [],
    noon: [],
    evening: [],
  };
  for (const slot of slots) {
    grouped[slot.daypart].push(slot);
  }
  for (const daypart of Object.keys(grouped) as SuggestionDaypart[]) {
    grouped[daypart].sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }
  return grouped;
}

export function firstGapRecommendation(slots: TodaysSuggestionSlot[]): {
  suggestionId: string | null;
  recommendation: SuggestionGapRecommendation | null;
} {
  const suggestion = slots.find(
    (slot) => slot.suggestion?.gapRecommendations.length,
  )?.suggestion;
  return {
    suggestionId: suggestion?.id ?? null,
    recommendation: suggestion?.gapRecommendations[0] ?? null,
  };
}

export function buildHeadline(
  date: string | undefined,
  timeZone: string,
  locale?: string,
): string {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone,
    }).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}
