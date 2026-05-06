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
  now: Date,
): string {
  if (!date) return "";
  try {
    const datePart = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone,
    }).format(new Date(`${date}T12:00:00Z`));
    const timePart = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(now);
    const cityPart = timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
    return `${datePart} · ${timePart} · ${cityPart}`;
  } catch {
    return date;
  }
}
