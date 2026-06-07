import type { AnalysisConcern } from "./skin-journal-analysis";

export type InsightKind =
  | "onboarding_progress"
  | "daily"
  | "weekly"
  | "monthly"
  | "trend"
  | "correlation"
  | "effectiveness"
  | "reaction_recovery"
  | "referral"
  | "photo_quality_drift"
  | "face_zone_pattern"
  | "routine_adherence"
  | "cycle"
  | "ai_summary"
  | "ai_pattern";

export type InsightWindow = "all" | "week" | "month";

export type InsightGenerationTrigger =
  | "photo_analysis_completed"
  | "check_in_updated"
  | "entry_deleted"
  | "scheduled_refresh"
  | "product_or_routine_changed";

export type InsightGenerationJobStatus =
  | "idle"
  | "queued"
  | "sent"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type InsightSourceType =
  | "deterministic"
  | "ai_polished"
  | "ai_sourced";

export type InsightEvidenceGrade =
  | "strong"
  | "moderate"
  | "limited"
  | "anecdotal";

export type InsightTone =
  | "neutral"
  | "positive"
  | "concern"
  | "warning"
  | "critical"
  | "ai";

export type InsightValue = string | number | boolean | null;
export type InsightValues = Record<string, InsightValue>;

export interface LocalizedInsightText {
  key: string;
  values?: InsightValues;
  text?: string | null;
}

export type InsightAction =
  | { kind: "view_entries"; entry_ids: string[] }
  | { kind: "open_compare"; from_date: string; to_date: string }
  | { kind: "open_product"; inventory_product_id: string }
  | { kind: "open_today_upload" }
  | { kind: "dismiss" }
  | { kind: "open_settings"; tab: string };

export type InsightBlock =
  | {
      type: "text";
      key: string;
      values?: InsightValues;
      text?: string | null;
      tone?: InsightTone;
    }
  | {
      type: "metric_delta";
      value: number;
      previous: number;
      unit?: "entries" | "rating";
      direction: "down_is_good" | "up_is_good" | "neutral";
      precision?: number;
    }
  | {
      type: "sparkline";
      series: Array<{ x: string; y: number }>;
      baseline?: number;
      markers?: Array<{ x: string; label?: LocalizedInsightText }>;
      y_domain?: [number, number];
    }
  | {
      type: "bar_strip";
      bars: Array<{ x: string; y: number; tone?: InsightTone }>;
      y_label?: LocalizedInsightText;
    }
  | {
      type: "dot_strip";
      dots: Array<{ x: string; tone: InsightTone; label?: string }>;
    }
  | {
      type: "regression";
      series: Array<{ x: string; y: number }>;
      slope: number;
      intercept: number;
      r2: number;
      ci_band?: number;
    }
  | {
      type: "event_study";
      before: Array<{ x: string; y: number }>;
      after: Array<{ x: string; y: number }>;
      marker: { x: string; label: LocalizedInsightText };
    }
  | {
      type: "face_heatmap";
      zones: Array<{
        location: string;
        weight: number;
        concern: AnalysisConcern;
      }>;
    }
  | {
      type: "factor_table";
      rows: Array<{
        factor: LocalizedInsightText;
        effect: number;
        n: number;
        tone?: InsightTone;
      }>;
      effect_unit?: "entries" | "rating";
    }
  | {
      type: "entry_thumbs";
      entry_ids: string[];
      max?: number;
      entries?: Array<{
        entry_id: string;
        date: string;
        photo_url: string | null;
      }>;
    }
  | { type: "disclaimer"; key: string; values?: InsightValues; tone: InsightTone }
  | { type: "cta_link"; key: string; values?: InsightValues; action: InsightAction }
  | { type: "source_link"; kb_id: string }
  | {
      type: "evidence_grade";
      grade: InsightEvidenceGrade;
      basis: LocalizedInsightText;
    };

export interface InsightMetadata {
  source: InsightSourceType;
  model: string | null;
  prompt_version: string | null;
  facts_hash: string;
  cache_hit: boolean;
  duration_ms: number;
}

export interface InsightSourceCitation {
  id: string;
  title_key: string;
  organization: string;
  summary_key: string;
  url: string;
  evidence_grade: Exclude<InsightEvidenceGrade, "anecdotal">;
  last_verified: string;
}

export interface JournalInsight {
  id: string;
  kind: InsightKind;
  severity: "info" | "warning" | "critical";
  confidence: number;
  headline: LocalizedInsightText;
  blocks: InsightBlock[];
  actions: InsightAction[];
  caveats: LocalizedInsightText[];
  source_entry_ids: string[];
  time_window: { start: string; end: string };
  data_cutoff_at: string;
  generation_trigger: InsightGenerationTrigger;
  metadata: InsightMetadata;
  sources: InsightSourceCitation[];
  generated_at: string;
  seen_at: string | null;
  dismissed_at: string | null;
}

export interface JournalInsightsMeta {
  total_entries: number;
  entries_until_next_insight: number;
  last_generated_at: string | null;
  generation_status: InsightGenerationJobStatus;
  active_job_trigger: InsightGenerationTrigger | null;
  active_job_run_after: string | null;
  active_job_last_error: string | null;
}

export interface JournalInsightsResponse {
  insights: JournalInsight[];
  meta: JournalInsightsMeta;
}
