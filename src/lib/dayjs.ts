import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/sv';

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export { dayjs };

const DATE_INPUT_FORMAT = 'YYYY-MM-DD';

function parseUtcValue(value: string | Date): dayjs.Dayjs {
  if (value instanceof Date) {
    return dayjs(value);
  }

  return dayjs.utc(value);
}

export function parseUtcDate(
  value: string | Date | null | undefined,
): dayjs.Dayjs | null {
  if (!value) {
    return null;
  }

  const parsed = parseUtcValue(value);
  return parsed.isValid() ? parsed : null;
}

export function formatLocalizedDate(
  value: string | Date | null | undefined,
  locale: string,
  format: string = 'll',
): string | null {
  const parsed = parseUtcDate(value);
  return parsed ? parsed.locale(locale).format(format) : null;
}

export function toDateInputValue(
  value: string | Date | null | undefined,
): string {
  const parsed = parseUtcDate(value);
  return parsed ? parsed.format(DATE_INPUT_FORMAT) : '';
}

export function toUtcIsoStringFromDateInput(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const parsed = dayjs.utc(value, DATE_INPUT_FORMAT, true);
  return parsed.isValid() ? parsed.toISOString() : null;
}

export function addMonthsToIsoString(
  value: string | Date | null | undefined,
  months: number,
): string | null {
  const parsed = parseUtcDate(value);
  return parsed ? parsed.add(months, 'month').toISOString() : null;
}

export function diffInDaysRounded(
  from: string | Date,
  to: string | Date,
): number {
  return Math.round(parseUtcValue(to).diff(parseUtcValue(from), 'day', true));
}

export function utcNow(): dayjs.Dayjs {
  return dayjs.utc();
}
