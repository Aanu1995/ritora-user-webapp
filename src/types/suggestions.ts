import type { ApplicationLog } from "@/types/application-tracking";
import type {
  OnDemandSuggestionIntent,
  SuggestionRequestContext,
  SuggestionRequestSource,
} from "@/types/on-demand-suggestions";
import type {
  TodaysSuggestionEnvironmentAlert,
  TodaysSuggestionEnvironmentSummary,
} from "@/types/environment-suggestions";
import type { RoutineBreak } from "@/types/routine-break";
import type { SuggestionGapActionKind } from "@/types/suggestion-gap-actions";
import type { SuggestionProductDataQuality } from "@/types/suggestion-quality";
export type {
  RecordSuggestionGapActionPayload,
  SuggestionGapActionKind,
  SuggestionGapActionResponse,
  SuggestionGapActionSourceType,
} from "@/types/suggestion-gap-actions";
export type {
  SuggestionAiConsent,
  UpdateSuggestionAiConsentPayload,
} from "@/types/suggestion-ai-consent";
export {
  ON_DEMAND_SUGGESTION_INTENSITIES,
  ON_DEMAND_SUGGESTION_INTENTS,
  SUGGESTION_REQUEST_SOURCES,
} from "@/types/on-demand-suggestions";
export type {
  CreateOnDemandSuggestionPayload,
  OnDemandSuggestionIntensity,
  OnDemandSuggestionIntent,
  SuggestionRequestContext,
  SuggestionRequestSource,
} from "@/types/on-demand-suggestions";
export {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentProviderName,
  EnvironmentStatus,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
} from "@/types/environment-suggestions";
export type {
  TodaysSuggestionEnvironmentAlert,
  TodaysSuggestionEnvironmentSummary,
} from "@/types/environment-suggestions";
export type {
  RoutineBreak,
  RoutineBreakState,
  RoutineBreakStatus,
  StartRoutineBreakPayload,
  UpdateRoutineBreakPayload,
} from "@/types/routine-break";
export type { SuggestionProductDataQuality } from "@/types/suggestion-quality";

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
  NationalEczemaSocietyHardWater = "national_eczema_society_hard_water",
  OpenMeteoWeather = "open_meteo_weather",
  OpenMeteoAirQuality = "open_meteo_air_quality",
  OpenMeteoSeasonalForecast = "open_meteo_seasonal_forecast",
}

export type SuggestionEvidenceType =
  | "dermatology_association"
  | "regulatory_guidance"
  | "clinical_reference"
  | "environmental_data_provider";

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
  routineNote: string | null;
  provenance: SuggestionStepProvenance;
  chips: SuggestionStepChip[];
  safetyWarnings: SuggestionSafetyFlag[];
  product: SuggestionStepProduct | null;
};

export type SuggestionInstance = {
  id: string;
  slotId: string | null;
  requestSource: SuggestionRequestSource;
  requestContext: SuggestionRequestContext | null;
  targetDate: string;
  targetTime: string;
  daypart: SuggestionDaypart;
  mode: SuggestionMode;
  generationStatus: SuggestionGenerationStatus;
  visibleAt: string;
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
  environmentSummary: TodaysSuggestionEnvironmentSummary | null;
  productDataQuality: SuggestionProductDataQuality;
  steps: SuggestionStep[];
  applicationLogId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TodaysSuggestionResponse = {
  date: string;
  timeZone: string;
  generatedAt: string;
  leadTimeMinutes: number;
  summary: TodaysSuggestionSummary;
  weatherSummary: TodaysSuggestionWeatherSummary | null;
  environmentSummary: TodaysSuggestionEnvironmentSummary | null;
  environmentAlerts: TodaysSuggestionEnvironmentAlert[];
  slots: TodaysSuggestionSlot[];
  onDemandSuggestions: TodaysOnDemandSuggestion[];
  reactionAlert: TodaysSuggestionReactionAlert | null;
  routineBreak: RoutineBreak | null;
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
  onDemand: number;
};

export type TodaysOnDemandSuggestion = {
  id: string;
  status: "generating" | "ready" | "recorded" | "edited" | "failed";
  requestedAt: string;
  recording: TodaysSuggestionRecording | null;
  applicationLog: ApplicationLog | null;
  suggestion: SuggestionInstance;
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
  environmentSummary: TodaysSuggestionEnvironmentSummary | null;
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
  requestSource: SuggestionRequestSource;
  onDemandIntent: OnDemandSuggestionIntent | null;
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
  requestSource?: SuggestionRequestSource;
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

export type SnoozeRecordingReminderPayload = {
  suggestionInstanceId: string;
  minutes?: number;
};

export type RecordingReminderSnoozeResponse = {
  suggestionInstanceId: string;
  snoozedUntil: string;
};
