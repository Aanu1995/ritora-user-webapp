import type { Daypart } from "@/types/schedule";
import type { SuggestionDaypart } from "@/types/suggestions";

/**
 * SuggestionDaypart uses 'noon' for midday slots while the existing schedule
 * Daypart uses 'afternoon' for the same midday window. They map to the same
 * CSS daypart-noon tokens. Keeping the naming distinct in the suggestion
 * domain (per the mockup) but reusing the icon machinery.
 */
export function suggestionDaypartToScheduleDaypart(
  daypart: SuggestionDaypart,
): Daypart {
  if (daypart === "noon") return "afternoon";
  return daypart;
}

/**
 * Format a HH:MM[:SS] slot time into a user-facing label like "8:30 AM".
 * Mockups use 12-hour with no leading zero on the hour.
 */
export function formatSlotTime12h(slotTime: string): string {
  const [hourStr = "0", minuteStr = "00"] = slotTime.split(":");
  const hour = Number.parseInt(hourStr, 10);
  const minutes = minuteStr.slice(0, 2);
  if (Number.isNaN(hour)) return slotTime;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minutes} ${suffix}`;
}

export function formatIsoTime12h(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return formatSlotTime12h(formatLocalTimeInput(date));
}

export function formatLocalTimeInput(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export function buildLocalDateTimeIso(date: string, time: string): string {
  const [yearStr = "0", monthStr = "1", dayStr = "1"] = date.split("-");
  const [hourStr = "0", minuteStr = "0"] = time.split(":");
  const localDate = new Date(
    Number.parseInt(yearStr, 10),
    Number.parseInt(monthStr, 10) - 1,
    Number.parseInt(dayStr, 10),
    Number.parseInt(hourStr, 10),
    Number.parseInt(minuteStr, 10),
    0,
    0,
  );
  return localDate.toISOString();
}

/**
 * Phrase the lead time gap as the mockup does: "Available 6:30 AM" /
 * "Unlocks in 1h 0m". The relative version is used inside locked cards;
 * the absolute version is used on the badge.
 */
export function formatRelativeUntil(targetIso: string): string {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return "Now";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
