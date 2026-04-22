import { Temporal } from '@js-temporal/polyfill';
import { DayOfWeek } from '@/types/schedule';
import {
  buildTimeZoneContext,
  buildTimeZoneMismatchKey,
  canUseBrowserStorage,
  isSupportedNamedTimeZone,
  TIME_ZONE_CANONICALIZATION_LOCALE,
  TIME_ZONE_MISMATCH_STORAGE_PREFIX,
  type ResolvedTimeZoneContext,
  type TimeZoneResolutionSource,
} from './time-zone.utils';

export const DEFAULT_TIME_ZONE = 'UTC';

const OFFSET_TIME_ZONE_PATTERN = /^(?:Z|[+-]\d{2}(?::?\d{2})?)$/i;
export type { ResolvedTimeZoneContext, TimeZoneResolutionSource };

const TEMPORAL_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  1: DayOfWeek.Mon,
  2: DayOfWeek.Tue,
  3: DayOfWeek.Wed,
  4: DayOfWeek.Thu,
  5: DayOfWeek.Fri,
  6: DayOfWeek.Sat,
  7: DayOfWeek.Sun,
};

let supportedTimeZonesCache: string[] | null = null;

function isOffsetTimeZone(value: string): boolean {
  return OFFSET_TIME_ZONE_PATTERN.test(value);
}

function resolveCanonicalTimeZone(value: string): string | null {
  try {
    const canonical = new Intl.DateTimeFormat(TIME_ZONE_CANONICALIZATION_LOCALE, {
      timeZone: value,
    }).resolvedOptions().timeZone;

    return isSupportedNamedTimeZone(canonical) ? canonical : null;
  } catch {
    return null;
  }
}

export function canonicalizeTimeZone(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || isOffsetTimeZone(trimmed)) {
    return null;
  }

  return resolveCanonicalTimeZone(trimmed);
}

export function resolveTimeZoneContext(
  savedTimeZone?: string | null,
  browserTimeZone?: string | null,
): ResolvedTimeZoneContext {
  const canonicalSavedTimeZone = canonicalizeTimeZone(savedTimeZone);
  const canonicalDeviceTimeZone = canonicalizeTimeZone(browserTimeZone);

  if (canonicalSavedTimeZone) {
    return buildTimeZoneContext(
      canonicalSavedTimeZone,
      canonicalSavedTimeZone,
      canonicalDeviceTimeZone,
      'saved',
    );
  }

  if (canonicalDeviceTimeZone) {
    return buildTimeZoneContext(
      canonicalDeviceTimeZone,
      null,
      canonicalDeviceTimeZone,
      'device',
    );
  }

  return buildTimeZoneContext(DEFAULT_TIME_ZONE, null, null, 'default');
}

export function getBrowserTimeZone(): string | null {
  try {
    return canonicalizeTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  } catch {
    return null;
  }
}

export function resolveScheduleTimeZone(
  savedTimeZone?: string | null,
  browserTimeZone?: string | null,
): string {
  return resolveTimeZoneContext(savedTimeZone, browserTimeZone).timeZone;
}

export function resolveDayOfWeekForTimeZone(timeZone: string): DayOfWeek {
  const zonedDateTime = Temporal.Now.instant().toZonedDateTimeISO(timeZone);
  return TEMPORAL_DAY_TO_DAY_OF_WEEK[zonedDateTime.dayOfWeek];
}

export function getSupportedTimeZones(): string[] {
  if (supportedTimeZonesCache) {
    return supportedTimeZonesCache;
  }

  const supportedValues = Intl.supportedValuesOf?.('timeZone');
  if (supportedValues?.length) {
    supportedTimeZonesCache = [DEFAULT_TIME_ZONE, ...supportedValues];
    return supportedTimeZonesCache;
  }

  supportedTimeZonesCache = [
    DEFAULT_TIME_ZONE,
    'Europe/Stockholm',
    'America/New_York',
  ];
  return supportedTimeZonesCache;
}

export function formatTimeZoneLabel(timeZone: string): string {
  return timeZone.replace(/_/g, ' ');
}

function getTimeZoneMismatchAckKey(
  savedTimeZone: string,
  deviceTimeZone: string,
): string | null {
  return buildTimeZoneMismatchKey(savedTimeZone, deviceTimeZone);
}

export function hasAcknowledgedTimeZoneMismatch(
  savedTimeZone: string,
  deviceTimeZone: string,
): boolean {
  if (!canUseBrowserStorage()) {
    return false;
  }

  const storageKey = getTimeZoneMismatchAckKey(savedTimeZone, deviceTimeZone);

  return (
    storageKey !== null && window.localStorage.getItem(storageKey) === '1'
  );
}

export function acknowledgeTimeZoneMismatch(
  savedTimeZone: string,
  deviceTimeZone: string,
): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  const storageKey = getTimeZoneMismatchAckKey(savedTimeZone, deviceTimeZone);

  if (storageKey) {
    window.localStorage.setItem(storageKey, '1');
  }
}

export function clearAcknowledgedTimeZoneMismatches(): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);

    if (key?.startsWith(TIME_ZONE_MISMATCH_STORAGE_PREFIX)) {
      window.localStorage.removeItem(key);
    }
  }
}
