/**
 * Domain model for AI-powered, schedule-anchored skincare suggestions.
 *
 * Drives the Today's Suggestion page, the Why-this-routine drawer, the gap
 * recommendation banner, the reaction banner, and the suggestion-history view.
 *
 * Each ScheduleSlot can have at most one non-superseded suggestion per
 * calendar date. The suggestion becomes visible to the user
 * `lead_time_minutes` before its scheduled time and stays open all day so
 * the user can record what they actually applied.
 */

import type { ApplicationLog } from "@/types/application-tracking";

export type SuggestionDaypart = "morning" | "noon" | "evening";
export const SUGGESTION_DAYPARTS: readonly SuggestionDaypart[] = [
  "morning",
  "noon",
  "evening",
];

export type SuggestionMode = "ai" | "manual" | "mixed";
export const SUGGESTION_MODES: readonly SuggestionMode[] = [
  "ai",
  "manual",
  "mixed",
];

/**
 * Lifecycle of a single suggestion instance.
 *
 * `pending` (created, not yet visible) -> `generating` (worker running) ->
 * `ready` (user can view + apply) -> `failed` or `superseded` (regenerated).
 */
export type SuggestionGenerationStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "superseded";

/**
 * Where a step came from. Drives the chip rendered on each step row in the
 * mockup: `Locked by specialist`, `Your routine`, or `Added by AI`.
 */
export type SuggestionStepProvenance =
  | "specialist_locked"
  | "user_routine"
  | "ai_added";

export type SuggestionChipTone =
  | "neutral"
  | "reason"
  | "ai"
  | "specialist"
  | "warn";

export type SuggestionStepChip = {
  tone: SuggestionChipTone;
  text: string;
};

export enum SuggestionEvidenceSourceId {
  AadSunscreenSelection = "aad_sunscreen_selection",
  AadRetinoidRetinol = "aad_retinoid_retinol",
  AadAcneTreatment = "aad_acne_treatment",
  FdaAhaSunSensitivity = "fda_aha_sun_sensitivity",
  MayoDrySkinCare = "mayo_dry_skin_care",
  DermNetTopicalRetinoids = "dermnet_topical_retinoids",
}

export type SuggestionEvidenceType =
  | "dermatology_association"
  | "regulatory_guidance"
  | "clinical_reference";

export type SuggestionEvidenceSource = {
  id: SuggestionEvidenceSourceId;
  title: string;
  organization: string;
  url: string;
  evidenceType: SuggestionEvidenceType;
  summary: string;
  reviewedAt: string;
};

export type SuggestionSafetyFlag = {
  severity: "info" | "warning" | "critical";
  message: string;
  ingredientSlugs: string[];
  sourceIds: SuggestionEvidenceSourceId[];
};

export type SuggestionGapRecommendation = {
  ingredientOrCategory: string;
  reason: string;
  budgetTier: "starter" | "mid" | "premium" | null;
  goalAlignment: string | null;
  sourceIds: SuggestionEvidenceSourceId[];
  userAction?: SuggestionGapActionKind | null;
};

export type SuggestionGapActionKind = "saved" | "dismissed";

/**
 * Multi-paragraph AI rationale shown in the "Why this routine" drawer.
 *
 * - `headline` is a one-line summary
 * - `body` is multiple paragraphs explaining the strategy
 * - `perStepReasons` explains each chosen step
 * - `skipped` lists products held back today and why
 * - `inputs` is the trace of what the AI used (skin profile, shelf, photos, etc.)
 */
export type SuggestionExplanation = {
  headline: string;
  body: string[];
  perStepReasons: { stepOrder: number; reason: string }[];
  skipped: { name: string; reason: string }[];
  inputs: { label: string; detail: string }[];
};

export type SuggestionStepProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  imageUrl: string | null;
  status: string;
};

export type SuggestionStep = {
  id: string;
  stepOrder: number;
  routineStepId: string | null;
  inventoryProductId: string | null;
  productBrand: string | null;
  productName: string | null;
  stepLabel: string;
  customLabel: string | null;
  applicationMethod: string | null;
  quantity: string | null;
  waitAfterMinutes: number | null;
  explanation: string | null;
  provenance: SuggestionStepProvenance;
  chips: SuggestionStepChip[];
  safetyWarnings: SuggestionSafetyFlag[];
  product: SuggestionStepProduct | null;
};

export type SuggestionInstance = {
  id: string;
  slotId: string | null;
  targetDate: string; // YYYY-MM-DD in user time zone
  targetTime: string; // HH:MM
  daypart: SuggestionDaypart;
  mode: SuggestionMode;
  generationStatus: SuggestionGenerationStatus;
  visibleAt: string; // ISO timestamp
  generatedAt: string | null;
  aiModel: string | null;
  aiPromptVersion: string | null;
  hasReactionSignal: boolean;
  simplifiedForReaction: boolean;
  rationaleHeadline: string | null;
  explanation: SuggestionExplanation | null;
  gapRecommendations: SuggestionGapRecommendation[];
  safetyFlags: SuggestionSafetyFlag[];
  inputTrace: Record<string, unknown> | null;
  evidenceSources: SuggestionEvidenceSource[];
  steps: SuggestionStep[];
  /** Linked application log id when the user has recorded what they applied. */
  applicationLogId: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Today's Suggestion page payload. The backend already knows the user's
 * time zone. Slots are returned in chronological order. Past-day slots
 * are filtered out server-side and live on the History page instead.
 */
export type TodaysSuggestionResponse = {
  date: string; // YYYY-MM-DD in user TZ
  timeZone: string;
  generatedAt: string; // ISO timestamp the response was assembled
  leadTimeMinutes: number;
  summary: TodaysSuggestionSummary;
  weatherSummary: TodaysSuggestionWeatherSummary | null;
  /** May include locked slots whose visibility window has not yet opened. */
  slots: TodaysSuggestionSlot[];
  /** Active reaction signal for today, if any. */
  reactionAlert: TodaysSuggestionReactionAlert | null;
};

export type TodaysSuggestionSummary = {
  total: number;
  locked: number;
  upcoming: number;
  ready: number;
  recordable: number;
  recorded: number;
  edited: number;
  failed: number;
};

export type TodaysSuggestionWeatherSummary = {
  temperatureCelsius: number | null;
  uvIndex: number | null;
  humidity: number | null;
  conditionLabel: string | null;
};

export type TodaysSuggestionReactionAlert = {
  detectedAt: string;
  simplificationId: string | null;
  canUseNormalRoutine: boolean;
  photoEntryId: string;
  severity: string | null;
  confidence: number | null;
  summary: string;
  pausedActiveNames: string[];
  affectedZones: string[];
  indicators: string[];
  concernKeys: string[];
  barrierConcern: boolean;
  photosUntilClear: number;
  clearCriteria: string[];
};

export type TodaysSuggestionSpecialist = {
  lockedStepCount: number;
  providerName: string | null;
  clinicName: string | null;
  activeSince: string | null;
  safetyNetMessage: string | null;
};

export type TodaysSuggestionSlot = {
  slotId: string;
  daypart: SuggestionDaypart;
  slotTime: string; // HH:MM
  mode: SuggestionMode;
  slotNotes: string | null;
  routineStepCount: number;
  specialistLockedStepCount: number;
  specialist: TodaysSuggestionSpecialist | null;
  visibleAt: string;
  status:
    | "locked"
    | "generating"
    | "ready"
    | "active"
    | "recordable"
    | "recorded"
    | "edited"
    | "missed"
    | "failed";
  slotStartsAt: string;
  recordableAt: string;
  expiresAt: string;
  recording: TodaysSuggestionRecording | null;
  recordingReminderSnoozedUntil: string | null;
  applicationLog: ApplicationLog | null;
  /** Server-computed: when the slot is locked. */
  isVisible: boolean;
  /** Once the suggestion is generated, this is populated. Null while locked. */
  suggestion: SuggestionInstance | null;
};

export type TodaysSuggestionRecording = {
  applicationLogId: string;
  appliedAt: string | null;
  hasBeenEdited: boolean;
  editCount: number;
  lastEditedAt: string | null;
  appliedCount: number;
  totalItems: number;
};

/**
 * History page payload. Date-grouped: the outer object is one entry per
 * past day with at least one suggestion that was actually provided.
 * Suggestions and their applied counterparts are joined here.
 */
export type SuggestionHistoryDay = {
  date: string;
  weatherSummary: TodaysSuggestionWeatherSummary | null;
  moodScore: number | null;
  hydrationTrend: "up" | "flat" | "down" | null;
  reactionFlagged: boolean;
  photoEntryId: string | null;
  slots: SuggestionHistorySlotSummary[];
};

export type SuggestionHistorySlotSummary = {
  slotId: string | null;
  suggestionId: string | null;
  applicationLogId: string | null;
  daypart: SuggestionDaypart;
  slotTime: string;
  mode: SuggestionMode;
  appliedCount: number;
  totalSteps: number;
  status: "applied" | "partial" | "skipped" | "simplified" | "missed";
  hasBeenEdited: boolean;
  summaryLine: string;
  suggestion?: SuggestionInstance | null;
  applicationLog?: ApplicationLog | null;
};

export type SuggestionHistoryListResponse = {
  days: SuggestionHistoryDay[];
  /** ISO date or null when no more pages. */
  nextCursor: string | null;
  totalApplied: number;
  totalSlots: number;
  totalEdited: number;
  adherencePercent: number | null;
};

export type SuggestionHistoryListQuery = {
  range?: "7d" | "30d" | "custom";
  fromDate?: string;
  toDate?: string;
  daypart?: SuggestionDaypart;
  mode?: SuggestionMode;
  status?: "applied" | "partial" | "skipped" | "simplified" | "missed";
  hasBeenEdited?: boolean;
  cursor?: string;
  limit?: number;
};

export type RegenerateSuggestionPayload = {
  reason?:
    | "user_requested"
    | "schedule_change"
    | "reaction_detected"
    | "normal_routine_requested";
};

export type NormalRoutineOverrideResponse = {
  targetDate: string;
  expiresAt: string;
  reactionEntryId: string | null;
};

export type RecordSuggestionGapActionPayload = {
  suggestionInstanceId: string;
  ingredientOrCategory: string;
  action: SuggestionGapActionKind;
};

export type SuggestionGapActionResponse = {
  suggestionInstanceId: string;
  ingredientOrCategory: string;
  normalizedKey: string;
  action: SuggestionGapActionKind;
};

export type SnoozeRecordingReminderPayload = {
  suggestionInstanceId: string;
  minutes?: number;
};

export type RecordingReminderSnoozeResponse = {
  suggestionInstanceId: string;
  snoozedUntil: string;
};
