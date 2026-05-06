import type { Daypart } from "@/types/schedule";
import type { SuggestionDaypart } from "@/types/suggestions";

export function suggestionDaypartToScheduleDaypart(
  daypart: SuggestionDaypart,
): Daypart {
  if (daypart === "noon") return "afternoon";
  return daypart;
}

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

export function formatRelativeUntil(targetIso: string): string {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return "Now";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
