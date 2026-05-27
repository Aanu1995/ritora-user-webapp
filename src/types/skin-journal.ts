import type {
  AnalysisConcern,
  AnalysisComparisonReference,
  AnalysisObservations,
  PhotoAnalysisInterpretation,
  PhotoReferenceQuality,
} from "./skin-journal-analysis";
import type { AnalysisFeedback } from "./skin-journal-feedback";
import type { AnalysisFailureCode } from "./skin-journal-analysis-failure";
import type { JournalInsight } from "./skin-journal-insights";
import type { PhotoFilterId, PhotoFilterKind } from "./skin-journal-photo-filters";
export type {
  AnalysisConcern,
  AnalysisComparisonReference,
  AnalysisObservations,
  PhotoAnalysisInterpretation,
  PhotoAnalysisConcernGuidance,
  PhotoAnalysisTextRef,
  PhotoAnalysisSourceCitation,
  PhotoReferenceQuality,
  PhotoReferenceQualityReason,
  PhotoReferenceQualityStatus,
  ReactionSeverity,
} from "./skin-journal-analysis";
export {
  PhotoAnalysisConcernReadLabel,
  PhotoAnalysisInterpretationVersion,
  PhotoAnalysisReadingLabel,
  PhotoAnalysisSchemaVersion,
} from "./skin-journal-analysis";
export type { AnalysisFailureCode } from "./skin-journal-analysis-failure";
export {
  ANALYSIS_FEEDBACK_REASONS,
  AnalysisFeedbackReason,
  AnalysisFeedbackVote,
} from "./skin-journal-feedback";
export type { AnalysisFeedback } from "./skin-journal-feedback";
export type {
  InsightAction,
  InsightBlock,
  InsightEvidenceGrade,
  InsightGenerationJobStatus,
  InsightGenerationTrigger,
  InsightKind,
  InsightMetadata,
  InsightSourceCitation,
  InsightSourceType,
  InsightTone,
  InsightValue,
  InsightValues,
  InsightWindow,
  JournalInsight,
  JournalInsightsMeta,
  JournalInsightsResponse,
  LocalizedInsightText,
} from "./skin-journal-insights";
export type { CompareResponse } from "./skin-journal-compare";
export { PhotoFilterKind, PhotoFilterStaticId } from "./skin-journal-photo-filters";
export type { PhotoFilterId } from "./skin-journal-photo-filters";
export type Angle = "head_on" | "left_profile" | "right_profile";
export const PHOTO_ANGLES: Angle[] = [
  "left_profile",
  "head_on",
  "right_profile",
];
export const FRONT_PHOTO_ANGLE: Angle = "head_on";
export type AnalysisStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "needs_review"
  | "skipped";

export type OverallFeel = "awful" | "bad" | "ok" | "good" | "great";

export const OVERALL_FEELS: OverallFeel[] = [
  "awful",
  "bad",
  "ok",
  "good",
  "great",
];

export type SleepBand = "lt5h" | "5to7h" | "7to9h" | "gt9h" | "skipped";

export const SLEEP_BANDS: SleepBand[] = ["lt5h", "5to7h", "7to9h", "gt9h"];

export type StressLevel = "low" | "mid" | "high";

export const STRESS_LEVELS: StressLevel[] = ["low", "mid", "high"];

export type SunExposure = "none" | "brief" | "lots";

export const SUN_EXPOSURES: SunExposure[] = ["none", "brief", "lots"];

export type CycleMarker =
  | "not_on"
  | "day_1_3"
  | "day_4_7"
  | "late_cycle"
  | "dont_track";

export const CYCLE_MARKER_DONT_TRACK: CycleMarker = "dont_track";

export const CYCLE_MARKERS: CycleMarker[] = [
  "not_on",
  "day_1_3",
  "day_4_7",
  "late_cycle",
  CYCLE_MARKER_DONT_TRACK,
];

export type RecentChangeKind =
  | "started_new_product"
  | "stopped_a_product"
  | "changed_frequency"
  | "got_a_treatment"
  | "felt_unwell"
  | "travelled"
  | "other";

export const RECENT_CHANGE_KINDS: RecentChangeKind[] = [
  "started_new_product",
  "stopped_a_product",
  "changed_frequency",
  "got_a_treatment",
  "felt_unwell",
  "travelled",
  "other",
];

export type EventKind =
  | "reaction_detected"
  | "worsening"
  | "recovery"
  | "dermatologist_referral"
  | "product_effectiveness";

export type EventSeverity = "info" | "warning" | "critical";

export type WrappedPeriodKind = "monthly" | "quarterly" | "yearly";

export type WrappedStatus =
  | "not_enough_photos"
  | "ready_to_generate"
  | "pending"
  | "generating"
  | "ready"
  | "failed";

export type ConcernKey =
  | "oiliness"
  | "dryness"
  | "redness"
  | "breakouts"
  | "texture"
  | "irritation"
  | "sensitivity";

export const CONCERN_KEYS: ConcernKey[] = [
  "oiliness",
  "dryness",
  "redness",
  "breakouts",
  "texture",
  "irritation",
  "sensitivity",
];

export type Ratings = Partial<Record<ConcernKey, 1 | 2 | 3 | 4 | 5>>;

export interface RecentChange {
  kind: RecentChangeKind;
  related_inventory_product_id?: string | null;
  note?: string | null;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  time_zone: string;
  photo_url: string | null;
  has_photo: boolean;
  photo_width: number | null;
  photo_height: number | null;
  photos?: JournalEntryPhoto[];
  angle_count?: number;
  has_side_photos?: boolean;
  angle: Angle;
  concern_focus: string[] | null;
  is_pre_routine: boolean;
  ratings: Ratings | null;
  overall_feel: OverallFeel | null;
  sleep_band: SleepBand | null;
  stress_today: StressLevel | null;
  sun_exposure_today: SunExposure | null;
  sweat_exercise_today: boolean | null;
  cycle_marker: CycleMarker | null;
  recent_change: RecentChange | null;
  complaint_note: string | null;
  analysis_status: AnalysisStatus;
  analysis_reference: AnalysisComparisonReference | null;
  photo_reference_quality: PhotoReferenceQuality;
  analysis_observations: AnalysisObservations | null;
  analysis_interpretation: PhotoAnalysisInterpretation | null;
  analysis_feedback: AnalysisFeedback | null;
  analysis_feedback_submitted: boolean;
  analysis_feedback_submitted_at: string | null;
  analysis_summary: string | null;
  analysis_model: string | null;
  analysis_version: string | null;
  analysis_prompt_version: string | null;
  analysis_error_code: AnalysisFailureCode | null;
  analysis_started_at: string | null;
  analysis_completed_at: string | null;
  analysis_duration_ms: number | null;
  analysis_input_image_count: number | null;
  analysis_input_tokens: number | null;
  analysis_output_tokens: number | null;
  analysis_total_tokens: number | null;
  analysis_estimated_cost_usd: number | null;
  analysis_retry_count: number;
  has_reaction: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryPhoto {
  angle: Angle;
  photo_url: string;
  width: number | null;
  height: number | null;
}

export type CalendarDayState =
  | "no_entry"
  | "entry_no_photo"
  | "pending"
  | "completed"
  | "reaction"
  | "failed";

export interface CalendarDay {
  date: string;
  state: CalendarDayState;
  entry_id: string | null;
  has_photo: boolean;
  has_reaction: boolean;
  has_insight: boolean;
  thumbnail_url: string | null;
  analysis_status: AnalysisStatus | null;
}

export interface CalendarPayload {
  month: string;
  days: CalendarDay[];
}

export interface PhotoDateItem {
  date: string;
  entry_id: string;
  analysis_status: AnalysisStatus;
  has_reaction: boolean;
}

export interface PhotoMonthItem {
  month: string;
  photo_count: number;
}

export interface PhotoDateIndex {
  dates: PhotoDateItem[];
  months: PhotoMonthItem[];
}

export interface PhotoFilterOption {
  id: PhotoFilterId;
  kind: PhotoFilterKind;
  value: AnalysisConcern | null;
  count: number;
}

export interface PhotoFilterIndex {
  filters: PhotoFilterOption[];
}

export interface PhotoPage {
  items: JournalEntry[];
  nextCursor: string | null;
}

export interface JournalEvent {
  id: string;
  entry_id: string;
  kind: EventKind;
  severity: EventSeverity;
  payload: Record<string, unknown> | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface JournalEventFilters {
  kind?: EventKind;
  from?: string;
  to?: string;
  acknowledged?: boolean;
}

export interface DayDetail {
  date: string;
  entry: JournalEntry | null;
  events: JournalEvent[];
  insights: JournalInsight[];
}

export interface WrappedManifestEntry {
  entry_id: string;
  entry_date: string;
  caption?: string | null;
  photo_url: string;
}

export interface WrappedManifest {
  entries: WrappedManifestEntry[];
  timing: { fade_ms: number; hold_ms: number };
}

export interface Wrapped {
  id: string;
  period_kind: WrappedPeriodKind;
  period_start: string;
  period_end: string;
  status: WrappedStatus;
  manifest: WrappedManifest | null;
  photo_count: number;
  generated_at: string | null;
  error: string | null;
}

export interface SimplificationEvent {
  id: string;
  triggered_by_event_id: string | null;
  started_at: string;
  ended_at: string | null;
  simplification_mode: "barrier_repair";
  reason: string | null;
  acknowledged_at: string | null;
  restore_strategy: "full" | "phased";
  original_schedule_snapshot: unknown | null;
}

export interface JournalStats {
  current_streak: number;
  total_entries: number;
  weekly_uploads: number;
  weekly_target: number;
  weekly_upload_rate: number;
  first_entry_date: string | null;
}

export interface UpsertEntryPayload {
  concern_focus?: string[];
  is_pre_routine?: boolean;
  ratings?: Ratings;
  overall_feel?: OverallFeel;
  sleep_band?: SleepBand;
  stress_today?: StressLevel;
  sun_exposure_today?: SunExposure;
  sweat_exercise_today?: boolean;
  cycle_marker?: CycleMarker;
  recent_change?: RecentChange | null;
  complaint_note?: string | null;
  skip_check_in?: boolean;
  photo_processing_consent?: boolean;
  remove_photo_angles?: Angle[];
}

export interface JournalExportPayload {
  generated_at: string;
  from: string;
  to: string;
  entries: Array<Record<string, unknown> & { photo_url: string | null }>;
  events: Record<string, unknown>[];
  insights: Record<string, unknown>[];
  wrapped: Record<string, unknown>[];
  simplifications: Record<string, unknown>[];
}

export interface JournalExportJob {
  id: string;
  status: "ready" | "failed";
  from: string;
  to: string;
  payload: JournalExportPayload | null;
  error: string | null;
  created_at: string;
}
