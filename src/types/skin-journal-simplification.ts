import type { ReactionSeverity } from "./skin-journal-analysis";
import type { ReactionReportSymptom } from "./skin-journal-reaction-report";

export interface SimplificationEvent {
  id: string;
  triggered_by_event_id: string | null;
  started_at: string;
  ended_at: string | null;
  simplification_mode: "barrier_repair";
  recovery_phase?: "stabilize" | "observe" | "phased_return";
  recovery_trigger_source?:
    | "unknown"
    | "manual"
    | "reaction_report"
    | "photo_analysis";
  recovery_trigger_symptoms?: ReactionReportSymptom[];
  recovery_trigger_severity?: ReactionSeverity | null;
  recovery_active_overuse?: boolean;
  recovery_review_after?: string | null;
  recovery_exit_eligible_at?: string | null;
  recovery_return_step?:
    | "not_started"
    | "barrier_only"
    | "one_active_test"
    | "building_frequency"
    | "complete";
  reason: string | null;
  acknowledged_at: string | null;
  restore_strategy: "full" | "phased";
  original_schedule_snapshot: unknown | null;
}
