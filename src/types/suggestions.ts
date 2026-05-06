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

export type SuggestionGenerationStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "superseded";

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
  applicationLogId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TodaysSuggestionResponse = {
  date: string; // YYYY-MM-DD in user TZ
  timeZone: string;
  generatedAt: string; // ISO timestamp the response was assembled
  leadTimeMinutes: number;
  summary: TodaysSuggestionSummary;
  weatherSummary: TodaysSuggestionWeatherSummary | null;
  slots: TodaysSuggestionSlot[];
  reactionAlert: TodaysSuggestionReactionAlert | null;
  routineBreak: RoutineBreak | null;
};

export type RoutineBreakStatus = "active" | "upcoming";

export type RoutineBreak = {
  id: string;
  status: RoutineBreakStatus;
  startedAt: string;
  endsAt: string | null;
  canResumeNow: boolean;
  message: string;
};

export type RoutineBreakState = {
  routineBreak: RoutineBreak | null;
};

export type StartRoutineBreakPayload = {
  endsAt?: string | null;
  reason?: string | null;
};

export type UpdateRoutineBreakPayload = {
  endsAt?: string | null;
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
  isVisible: boolean;
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
