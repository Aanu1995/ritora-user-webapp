export const TIME_ZONE_CANONICALIZATION_LOCALE = 'en-US';
export const TIME_ZONE_MISMATCH_STORAGE_PREFIX = 'ritora:timezone-mismatch:';

export type TimeZoneResolutionSource = 'saved' | 'device' | 'default';

export type ResolvedTimeZoneContext = {
  timeZone: string;
  savedTimeZone: string | null;
  deviceTimeZone: string | null;
  source: TimeZoneResolutionSource;
};

export type TimeZoneMismatchState = {
  deviceTimeZone: string | null;
  isAcknowledged: boolean;
  mismatchKey: string | null;
  savedTimeZone: string | null;
  shouldShow: boolean;
};

export function isSupportedNamedTimeZone(timeZone: string): boolean {
  return (
    timeZone === 'UTC' ||
    timeZone.includes('/') ||
    timeZone.startsWith('Etc/')
  );
}

export function buildTimeZoneContext(
  timeZone: string,
  savedTimeZone: string | null,
  deviceTimeZone: string | null,
  source: TimeZoneResolutionSource,
): ResolvedTimeZoneContext {
  return {
    timeZone,
    savedTimeZone,
    deviceTimeZone,
    source,
  };
}

export function buildTimeZoneMismatchKey(
  savedTimeZone: string | null | undefined,
  deviceTimeZone: string | null | undefined,
): string | null {
  if (!savedTimeZone || !deviceTimeZone || savedTimeZone === deviceTimeZone) {
    return null;
  }

  return `${TIME_ZONE_MISMATCH_STORAGE_PREFIX}${savedTimeZone}->${deviceTimeZone}`;
}

export function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined';
}

export function resolveTimeZoneMismatchState({
  deviceTimeZone,
  dismissedMismatchKey,
  hasAcknowledgedMismatch,
  savedTimeZone,
}: {
  deviceTimeZone: string | null | undefined;
  dismissedMismatchKey: string | null;
  hasAcknowledgedMismatch: (
    savedTimeZone: string,
    deviceTimeZone: string,
  ) => boolean;
  savedTimeZone: string | null | undefined;
}): TimeZoneMismatchState {
  const normalizedSavedTimeZone = savedTimeZone ?? null;
  const normalizedDeviceTimeZone = deviceTimeZone ?? null;
  const mismatchKey = buildTimeZoneMismatchKey(
    normalizedSavedTimeZone,
    normalizedDeviceTimeZone,
  );

  const isAcknowledged = Boolean(
    mismatchKey &&
      normalizedSavedTimeZone &&
      normalizedDeviceTimeZone &&
      (dismissedMismatchKey === mismatchKey ||
        hasAcknowledgedMismatch(
          normalizedSavedTimeZone,
          normalizedDeviceTimeZone,
        )),
  );

  return {
    deviceTimeZone: normalizedDeviceTimeZone,
    isAcknowledged,
    mismatchKey,
    savedTimeZone: normalizedSavedTimeZone,
    shouldShow: Boolean(mismatchKey) && !isAcknowledged,
  };
}
