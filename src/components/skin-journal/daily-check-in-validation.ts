import { z } from "zod";
import {
  CONCERN_KEYS,
  CYCLE_MARKER_DONT_TRACK,
  CYCLE_MARKERS,
  RECENT_CHANGE_KINDS,
  REACTION_REPORT_LOCATIONS,
  REACTION_REPORT_ONSETS,
  REACTION_REPORT_RED_FLAGS,
  REACTION_REPORT_SEVERITIES,
  REACTION_REPORT_SYMPTOMS,
  REACTION_REPORT_TRIGGERS,
  SLEEP_BANDS,
  STRESS_LEVELS,
  SUN_EXPOSURES,
  OVERALL_FEELS,
  type ConcernKey,
  type CycleMarker,
  type OverallFeel,
  type Ratings,
  type RecentChange,
  type ReactionReport,
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
  reaction_report?: ReactionReport | null;
  complaint_note?: string | null;
}

export type CheckInRequiredField =
  | "overall_feel"
  | "ratings"
  | "sleep_band"
  | "stress_today"
  | "sun_exposure_today"
  | "sweat_exercise_today"
  | "cycle_marker"
  | "reaction_report_symptoms";

export interface CheckInValidationResult {
  valid: boolean;
  missing: CheckInRequiredField[];
}

interface CheckInValidationOptions {
  requireCycleMarker?: boolean;
}

interface CheckInPayloadOptions {
  cycleMarkerFallback?: CycleMarker;
}

const VALID_RATINGS = [1, 2, 3, 4, 5] as const;
const MAX_COMPLAINT_NOTE_LENGTH = 2000;
const MAX_REACTION_NOTE_LENGTH = 1000;

export function createEmptyReactionReport(): ReactionReport {
  return {
    symptoms: [],
    severity: "mild",
    onset: null,
    locations: [],
    red_flags: [],
    suspected_trigger: null,
    note: null,
  };
}

export const EMPTY_REACTION_REPORT: ReactionReport =
  createEmptyReactionReport();

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

function nullableReactionReport(input: unknown): input is ReactionReport | null {
  if (input === null || input === undefined) {
    return true;
  }

  if (!isRecord(input)) {
    return false;
  }

  const symptoms = input.symptoms;
  const locations = input.locations;
  const redFlags = input.red_flags;
  return (
    Array.isArray(symptoms) &&
    symptoms.length > 0 &&
    symptoms.every((item) =>
      REACTION_REPORT_SYMPTOMS.includes(item as never),
    ) &&
    typeof input.severity === "string" &&
    REACTION_REPORT_SEVERITIES.includes(input.severity as never) &&
    (input.onset === null ||
      input.onset === undefined ||
      (typeof input.onset === "string" &&
        REACTION_REPORT_ONSETS.includes(input.onset as never))) &&
    (locations === undefined ||
      (Array.isArray(locations) &&
        locations.every((item) =>
          REACTION_REPORT_LOCATIONS.includes(item as never),
        ))) &&
    (redFlags === undefined ||
      (Array.isArray(redFlags) &&
        redFlags.every((item) =>
          REACTION_REPORT_RED_FLAGS.includes(item as never),
        ))) &&
    (input.suspected_trigger === null ||
      input.suspected_trigger === undefined ||
      (typeof input.suspected_trigger === "string" &&
        REACTION_REPORT_TRIGGERS.includes(input.suspected_trigger as never))) &&
    (input.note === null ||
      input.note === undefined ||
      (typeof input.note === "string" &&
        input.note.length <= MAX_REACTION_NOTE_LENGTH))
  );
}

function normalizeReactionReport(
  report: ReactionReport | null | undefined,
): ReactionReport | null {
  const symptoms = Array.isArray(report?.symptoms) ? report.symptoms : [];
  if (!report || symptoms.length === 0) {
    return null;
  }

  return {
    symptoms,
    severity: report.severity,
    onset: report.onset ?? null,
    locations: report.locations ?? [],
    red_flags: report.red_flags ?? [],
    suspected_trigger: report.suspected_trigger ?? null,
    note: report.note?.trim() ? report.note.trim() : null,
  };
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
  reaction_report: z.custom<ReactionReport | null | undefined>(
    nullableReactionReport,
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
  options: CheckInValidationOptions = {},
): CheckInValidationResult {
  const requireCycleMarker = options.requireCycleMarker ?? true;
  const reactionReportMissingSymptoms = Boolean(
    value.reaction_report &&
      (value.reaction_report.symptoms?.length ?? 0) === 0,
  );
  const valueForValidation = requireCycleMarker
    ? value
    : { ...value, cycle_marker: CYCLE_MARKER_DONT_TRACK };
  const parsed = requiredCheckInSchema.safeParse(valueForValidation);
  if (parsed.success && !reactionReportMissingSymptoms) {
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
  if (requireCycleMarker && !value.cycle_marker) {
    missing.push("cycle_marker");
  }
  if (reactionReportMissingSymptoms) {
    missing.push("reaction_report_symptoms");
  }

  return { valid: false, missing };
}

export function checkInToPayload(
  value: CheckInFormValue,
  options: CheckInPayloadOptions = {},
): UpsertEntryPayload {
  return {
    overall_feel: value.overall_feel,
    ratings: value.ratings,
    sleep_band: value.sleep_band,
    stress_today: value.stress_today,
    sun_exposure_today: value.sun_exposure_today,
    sweat_exercise_today: value.sweat_exercise_today,
    cycle_marker: value.cycle_marker ?? options.cycleMarkerFallback,
    recent_change: value.recent_change,
    reaction_report: normalizeReactionReport(value.reaction_report),
    complaint_note: value.complaint_note,
  };
}
