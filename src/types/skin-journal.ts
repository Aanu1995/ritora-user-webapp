export type Angle = "head_on" | "left_profile" | "right_profile";

export const ANGLE_VALUES: Angle[] = [
  "head_on",
  "left_profile",
  "right_profile",
];

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

export const CYCLE_MARKERS: CycleMarker[] = [
  "not_on",
  "day_1_3",
  "day_4_7",
  "late_cycle",
  "dont_track",
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

export type InsightKind =
  | "daily"
  | "weekly"
  | "monthly"
  | "trend"
  | "correlation"
  | "effectiveness"
  | "reaction_recovery"
  | "referral";

export type WrappedPeriodKind = "monthly" | "quarterly" | "yearly";

export type WrappedStatus =
  | "not_enough_photos"
  | "ready_to_generate"
  | "pending"
  | "generating"
  | "ready"
  | "failed";

export type ReactionSeverity = "none" | "mild" | "moderate" | "severe";

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

export interface AnalysisObservations {
  schema_version: "1.0";
  model_version: string;
  image_quality: {
    face_detected: boolean;
    lighting_quality: "poor" | "fair" | "good" | "excellent";
    framing_quality: "poor" | "fair" | "good" | "excellent";
    blur_detected: boolean;
    issues: string[];
  };
  detected_concerns: Array<{
    concern: string;
    severity: "mild" | "moderate" | "severe";
    locations: string[];
    confidence: number;
  }>;
  reaction_signals: {
    reaction_detected: boolean;
    reaction_severity: ReactionSeverity;
    indicators: string[];
    confidence: number;
  };
  barrier_signs: {
    barrier_compromise: boolean;
    indicators: string[];
  };
  overall_assessment: string;
  should_flag_for_doctor: boolean;
  doctor_flag_reason?: string;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  time_zone: string;
  photo_url: string | null;
  has_photo: boolean;
  photo_width: number | null;
  photo_height: number | null;
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
  analysis_observations: AnalysisObservations | null;
  analysis_summary: string | null;
  analysis_completed_at: string | null;
  analysis_retry_count: number;
  has_reaction: boolean;
  created_at: string;
  updated_at: string;
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

export interface JournalInsight {
  id: string;
  kind: InsightKind;
  summary: string | null;
  supporting_data: Record<string, unknown> | null;
  related_entry_ids: string[] | null;
  severity: EventSeverity;
  generated_at: string;
  seen_at: string | null;
  dismissed_at: string | null;
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

export interface CompareResponse {
  from: JournalEntry | null;
  to: JournalEntry | null;
  delta: {
    bullets: Array<{
      text: string;
      tone: "good" | "warn" | "neutral";
    }>;
  };
}

export interface UpsertEntryPayload {
  angle?: Angle;
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
