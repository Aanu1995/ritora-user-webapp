import { Temporal } from '@js-temporal/polyfill';
import { toDateInputValue, toUtcIsoStringFromDateInput } from '@/lib/dayjs';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';

export type ShelfNowInput = Date | string | Temporal.Instant;

function resolveDateKey(value: string | Date | null | undefined): string | null {
  const dateKey = toDateInputValue(value);
  return dateKey || null;
}

function resolveInstant(now: ShelfNowInput | undefined): Temporal.Instant {
  if (!now) {
    return Temporal.Now.instant();
  }

  if (now instanceof Date) {
    return Temporal.Instant.from(now.toISOString());
  }

  return typeof now === 'string' ? Temporal.Instant.from(now) : now;
}

export function parseShelfPlainDate(
  value: string | Date | null | undefined,
): Temporal.PlainDate | null {
  const dateKey = resolveDateKey(value);
  return dateKey ? Temporal.PlainDate.from(dateKey) : null;
}

export function toShelfCalendarSelectionDate(
  value: string | Date | null | undefined,
): Date | undefined {
  const dateKey = resolveDateKey(value);
  if (!dateKey) {
    return undefined;
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function resolveShelfToday(
  timeZone: string = DEFAULT_TIME_ZONE,
  now?: ShelfNowInput,
): Temporal.PlainDate {
  return resolveInstant(now).toZonedDateTimeISO(timeZone).toPlainDate();
}

export function millisecondsUntilNextShelfDay(
  timeZone: string = DEFAULT_TIME_ZONE,
  now?: ShelfNowInput,
): number {
  const instant = resolveInstant(now);
  const zonedDateTime = instant.toZonedDateTimeISO(timeZone);
  const nextMidnight = zonedDateTime
    .toPlainDate()
    .add({ days: 1 })
    .toPlainDateTime(Temporal.PlainTime.from('00:00'))
    .toZonedDateTime(timeZone);

  const milliseconds = Math.ceil(
    nextMidnight.toInstant().since(instant).total({ unit: 'millisecond' }),
  );

  return Math.max(1, milliseconds);
}

export function diffShelfCalendarDays(
  from: Temporal.PlainDate,
  to: Temporal.PlainDate,
): number {
  return from.until(to, { largestUnit: 'day' }).days;
}

export function toShelfStoredIsoString(date: Temporal.PlainDate): string {
  return (
    toUtcIsoStringFromDateInput(date.toString()) ??
    `${date.toString()}T00:00:00.000Z`
  );
}
