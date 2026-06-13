export function weekdayShort(date: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(`${date}T12:00:00Z`),
    );
  } catch {
    return "";
  }
}

export function formatDayDetailDate(date: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}
