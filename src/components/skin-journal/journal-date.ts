export function resolveCanonicalTodayDate(
  backendTodayDate: string | undefined,
  fallbackTodayDate: string,
): string {
  return backendTodayDate ?? fallbackTodayDate;
}

function parseYmdAsLocal(ymd: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * Mockup-style short date: "Apr 26" when the date is in the current year,
 * "Apr 26, 2025" when the year differs from the current year.
 */
export function formatJournalShortDate(
  ymd: string | null | undefined,
  locale: string,
): string {
  if (!ymd) return "";
  const date = parseYmdAsLocal(ymd);
  if (!date) return ymd;
  const currentYear = new Date().getFullYear();
  const includeYear = date.getFullYear() !== currentYear;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

/**
 * Mockup-style long date: "Tue · Apr 28, 2026" (always includes the year).
 */
export function formatJournalLongDate(
  ymd: string | null | undefined,
  locale: string,
): string {
  if (!ymd) return "";
  const date = parseYmdAsLocal(ymd);
  if (!date) return ymd;
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: "short",
  }).format(date);
  const main = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return `${weekday} · ${main}`;
}
