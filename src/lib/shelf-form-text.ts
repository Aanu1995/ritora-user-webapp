import { parseUtcDate } from '@/lib/dayjs';

export function trimOrNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeStringList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function isValidDateString(value: string | null): boolean {
  return Boolean(parseUtcDate(value));
}
