const DASHBOARD_SETUP_TOTAL = 3;
const JOURNAL_PHOTO_NUDGE_HOUR = 8;
const FALLBACK_TIME_ZONE = "UTC";
const PROFILE_NOT_FOUND_STATUS = 404;

export enum DashboardGreetingKey {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
}

type SkinProfileSetupFields = {
  skinType?: string | null;
};

type DashboardSetupInput = {
  scheduleSlots?: ReadonlyArray<unknown> | null;
  shelfStats?: Readonly<Record<string, number>> | null;
  skinProfile?: SkinProfileSetupFields | null;
};

type FreshAccountInput = {
  isLoading: boolean;
  profileErrorStatus?: number;
  skinProfile?: SkinProfileSetupFields | null;
};

type JournalPhotoNudgeInput = {
  hasPhoto: boolean;
  nowIso: string;
  timeZone: string;
};

type DashboardSetupProgress = {
  completedCount: number;
  isComplete: boolean;
  profileDone: boolean;
  routineDone: boolean;
  shelfDone: boolean;
  totalCount: number;
};

function parseDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function getFormatter(
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone,
    });
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: FALLBACK_TIME_ZONE,
    });
  }
}

function readPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function readHourInTimeZone(timeZone: string, nowIso: string): number {
  const parts = getFormatter(timeZone, {
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parseDate(nowIso));
  const hour = Number(readPart(parts, "hour"));

  if (!Number.isFinite(hour)) {
    return 0;
  }

  return hour === 24 ? 0 : hour;
}

function hasCompletedSkinProfile(
  skinProfile: SkinProfileSetupFields | null | undefined,
): boolean {
  return Boolean(skinProfile?.skinType?.trim());
}

function hasShelfProducts(
  shelfStats: Readonly<Record<string, number>> | null | undefined,
): boolean {
  return Object.values(shelfStats ?? {}).some(
    (value) => Number.isFinite(value) && value > 0,
  );
}

function hasRoutineSlots(
  scheduleSlots: ReadonlyArray<unknown> | null | undefined,
): boolean {
  return (scheduleSlots?.length ?? 0) > 0;
}

export function getTodayDateInTimeZone(
  timeZone: string,
  nowIso: string,
): string {
  const parts = getFormatter(timeZone, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(parseDate(nowIso));
  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");

  return `${year}-${month}-${day}`;
}

export function getDashboardGreetingKey(
  timeZone: string,
  nowIso: string,
): DashboardGreetingKey {
  const hour = readHourInTimeZone(timeZone, nowIso);

  if (hour < 12) {
    return DashboardGreetingKey.Morning;
  }

  if (hour < 17) {
    return DashboardGreetingKey.Afternoon;
  }

  return DashboardGreetingKey.Evening;
}

export function shouldShowJournalPhotoNudge({
  hasPhoto,
  nowIso,
  timeZone,
}: JournalPhotoNudgeInput): boolean {
  return (
    !hasPhoto &&
    readHourInTimeZone(timeZone, nowIso) >= JOURNAL_PHOTO_NUDGE_HOUR
  );
}

export function getDashboardSetupProgress({
  scheduleSlots,
  shelfStats,
  skinProfile,
}: DashboardSetupInput): DashboardSetupProgress {
  const profileDone = hasCompletedSkinProfile(skinProfile);
  const shelfDone = hasShelfProducts(shelfStats);
  const routineDone = hasRoutineSlots(scheduleSlots);
  const completedCount = [profileDone, shelfDone, routineDone].filter(
    Boolean,
  ).length;

  return {
    completedCount,
    isComplete: completedCount === DASHBOARD_SETUP_TOTAL,
    profileDone,
    routineDone,
    shelfDone,
    totalCount: DASHBOARD_SETUP_TOTAL,
  };
}

export function isFreshDashboardAccount({
  isLoading,
  profileErrorStatus,
  skinProfile,
}: FreshAccountInput): boolean {
  if (isLoading) {
    return false;
  }

  if (profileErrorStatus === PROFILE_NOT_FOUND_STATUS) {
    return true;
  }

  if (skinProfile === undefined) {
    return false;
  }

  return !hasCompletedSkinProfile(skinProfile);
}
