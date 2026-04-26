import {
  millisecondsUntilNextShelfDay,
  toShelfCalendarSelectionDate,
} from '@/lib/shelf-date';

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

describe('shelf-date helpers', () => {
  it('keeps the same calendar day for picker selection across timezones', () => {
    const selectionDate = toShelfCalendarSelectionDate(
      '2026-04-01T00:00:00.000Z',
    );

    expect(selectionDate).toBeDefined();
    expect(formatDateInTimeZone(selectionDate as Date, 'America/New_York')).toBe(
      '2026-04-01',
    );
    expect(formatDateInTimeZone(selectionDate as Date, 'Europe/Stockholm')).toBe(
      '2026-04-01',
    );
  });

  it('calculates the next shelf-day refresh against the effective timezone midnight', () => {
    expect(
      millisecondsUntilNextShelfDay(
        'America/New_York',
        '2026-04-01T03:59:59.000Z',
      ),
    ).toBe(1000);
  });
});
