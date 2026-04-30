import { z } from "zod";
import {
  CONCERN_KEYS,
  CYCLE_MARKERS,
  RECENT_CHANGE_KINDS,
  SLEEP_BANDS,
  STRESS_LEVELS,
  SUN_EXPOSURES,
  OVERALL_FEELS,
  type ConcernKey,
  type CycleMarker,
  type OverallFeel,
  type Ratings,
  type RecentChange,
  type SleepBand,
  type StressLevel,
  type SunExposure,
  type UpsertEntryPayload,
} from "@/types/skin-journal";

export interface CheckInFormValue {
  overall_feel?: OverallFeel;
  ratings: Ratings;
  sleep_band?: SleepBand;
  stress_today?: StressLevel;
  sun_exposure_today?: SunExposure;
  sweat_exercise_today?: boolean;
  cycle_marker?: CycleMarker;
  recent_change?: RecentChange | null;
  complaint_note?: string | null;
}

export type CheckInRequiredField =
  | "overall_feel"
  | "ratings"
  | "sleep_band"
  | "stress_today"
  | "sun_exposure_today"
  | "sweat_exercise_today"
  | "cycle_marker";

export interface CheckInValidationResult {
  valid: boolean;
  missing: CheckInRequiredField[];
}

const VALID_RATINGS = [1, 2, 3, 4, 5] as const;
const MAX_COMPLAINT_NOTE_LENGTH = 2000;

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isRating(input: unknown): input is 1 | 2 | 3 | 4 | 5 {
  return (
    typeof input === "number" &&
    VALID_RATINGS.includes(input as (typeof VALID_RATINGS)[number])
  );
}

function optionalStringEnum<T extends string>(values: readonly T[]) {
  return z.custom<T | undefined>(
    (input) =>
      input === undefined ||
      (typeof input === "string" && values.includes(input as T)),
  );
}

function requiredStringEnum<T extends string>(values: readonly T[]) {
  return z.custom<T>(
    (input) => typeof input === "string" && values.includes(input as T),
  );
}

function nullableRecentChange(input: unknown): input is RecentChange | null {
  if (input === null || input === undefined) {
    return true;
  }

  if (!isRecord(input) || typeof input.kind !== "string") {
    return false;
  }

  return RECENT_CHANGE_KINDS.includes(input.kind as RecentChange["kind"]);
}

const ratingsSchema = z.custom<Ratings>((input) => {
  if (!isRecord(input)) {
    return false;
  }

  return Object.entries(input).every(
    ([key, rating]) =>
      CONCERN_KEYS.includes(key as ConcernKey) && isRating(rating),
  );
});

const completeRatingsSchema = z.custom<Ratings>((input) => {
  if (!isRecord(input)) {
    return false;
  }

  return CONCERN_KEYS.every((key) => isRating(input[key]));
});

export const checkInFormSchema = z.object({
  overall_feel: optionalStringEnum(OVERALL_FEELS),
  ratings: ratingsSchema,
  sleep_band: optionalStringEnum(SLEEP_BANDS),
  stress_today: optionalStringEnum(STRESS_LEVELS),
  sun_exposure_today: optionalStringEnum(SUN_EXPOSURES),
  sweat_exercise_today: z.boolean().optional(),
  cycle_marker: optionalStringEnum(CYCLE_MARKERS),
  recent_change: z.custom<RecentChange | null | undefined>(
    nullableRecentChange,
  ),
  complaint_note: z
    .string()
    .max(MAX_COMPLAINT_NOTE_LENGTH, "validation.noteTooLong")
    .nullable()
    .optional(),
});

const requiredCheckInSchema = z.object({
  overall_feel: requiredStringEnum(OVERALL_FEELS),
  ratings: completeRatingsSchema,
  sleep_band: requiredStringEnum(SLEEP_BANDS),
  stress_today: requiredStringEnum(STRESS_LEVELS),
  sun_exposure_today: requiredStringEnum(SUN_EXPOSURES),
  sweat_exercise_today: z.boolean(),
  cycle_marker: requiredStringEnum(CYCLE_MARKERS),
});

export function validateCheckInForSave(
  value: CheckInFormValue,
): CheckInValidationResult {
  const parsed = requiredCheckInSchema.safeParse(value);
  if (parsed.success) {
    return { valid: true, missing: [] };
  }

  const missing: CheckInRequiredField[] = [];
  if (!value.overall_feel) {
    missing.push("overall_feel");
  }
  if (!completeRatingsSchema.safeParse(value.ratings).success) {
    missing.push("ratings");
  }
  if (!value.sleep_band) {
    missing.push("sleep_band");
  }
  if (!value.stress_today) {
    missing.push("stress_today");
  }
  if (!value.sun_exposure_today) {
    missing.push("sun_exposure_today");
  }
  if (value.sweat_exercise_today === undefined) {
    missing.push("sweat_exercise_today");
  }
  if (!value.cycle_marker) {
    missing.push("cycle_marker");
  }

  return { valid: false, missing };
}

export function checkInToPayload(value: CheckInFormValue): UpsertEntryPayload {
  return {
    overall_feel: value.overall_feel,
    ratings: value.ratings,
    sleep_band: value.sleep_band,
    stress_today: value.stress_today,
    sun_exposure_today: value.sun_exposure_today,
    sweat_exercise_today: value.sweat_exercise_today,
    cycle_marker: value.cycle_marker,
    recent_change: value.recent_change,
    complaint_note: value.complaint_note,
  };
}
