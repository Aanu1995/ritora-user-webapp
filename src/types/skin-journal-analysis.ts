export type ReactionSeverity = "none" | "mild" | "moderate" | "severe";

export type AnalysisConcern =
  | "acne"
  | "hyperpigmentation"
  | "redness_inflammation"
  | "texture"
  | "oiliness"
  | "dryness"
  | "fine_lines"
  | "skin_barrier_damage"
  | "eczema_indicator"
  | "uneven_tone"
  | "under_eye_darkness"
  | "large_pores";

export type AnalysisChangeDirection =
  | "improved"
  | "worsened"
  | "stable"
  | "new"
  | "not_comparable"
  | "unknown";

export type AnalysisTrendExclusionReason =
  | "poor_lighting"
  | "poor_framing"
  | "blur"
  | "no_face_detected"
  | "occlusion"
  | "makeup_or_filter_present"
  | "not_comparable";

export type AnalysisSafetyReason =
  | "possible_swelling"
  | "hive_like_appearance"
  | "widespread_severe_irritation"
  | "rapid_worsening"
  | "eye_area_involvement"
  | "cracking_or_open_skin_appearance"
  | "possible_infection_signs";

export type PhotoReferenceQualityStatus =
  | "good_reference"
  | "limited_reference"
  | "not_trend_safe";

export type PhotoReferenceQualityReason =
  | "no_photo"
  | "analysis_pending"
  | "analysis_failed"
  | "analysis_unavailable"
  | "face_missing"
  | "needs_retake"
  | "poor_lighting"
  | "poor_framing"
  | "blur"
  | "quality_limited"
  | "reaction_day"
  | "not_comparable";

export interface PhotoReferenceQuality {
  status: PhotoReferenceQualityStatus;
  reasons: PhotoReferenceQualityReason[];
  quality_score: number | null;
}

export interface AnalysisComparisonReference {
  entry_id: string;
  entry_date: string;
  quality: PhotoReferenceQuality;
}

export enum PhotoAnalysisSchemaVersion {
  V1_0 = "1.0",
  V1_1 = "1.1",
  V1_2 = "1.2",
}

export interface AnalysisObservations {
  schema_version: PhotoAnalysisSchemaVersion;
  model_version: string;
  image_quality: {
    face_detected: boolean;
    lighting_quality: "poor" | "fair" | "good" | "excellent";
    framing_quality: "poor" | "fair" | "good" | "excellent";
    blur_detected: boolean;
    issues: string[];
    quality_score?: number;
    needs_retake?: boolean;
    excluded_from_trends_reason?: AnalysisTrendExclusionReason | null;
  };
  per_angle_quality?: Array<{
    angle: "head_on" | "left_profile" | "right_profile";
    face_detected: boolean;
    lighting_quality: "poor" | "fair" | "good" | "excellent";
    framing_quality: "poor" | "fair" | "good" | "excellent";
    blur_detected: boolean;
    issues: string[];
    quality_score?: number;
    needs_retake?: boolean;
    used_for_analysis: boolean;
  }>;
  detected_concerns: Array<{
    concern: AnalysisConcern;
    severity: "mild" | "moderate" | "severe";
    locations: string[];
    confidence: number;
    change_from_previous?: AnalysisChangeDirection;
    change_confidence?: number;
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
  overall_change_from_previous?: AnalysisChangeDirection;
  comparison_reference?: AnalysisComparisonReference | null;
  user_visible_message?: string;
  safety_flags?: {
    urgent_review_recommended: boolean;
    doctor_follow_up_recommended: boolean;
    reasons: AnalysisSafetyReason[];
  };
  should_flag_for_doctor: boolean;
  doctor_flag_reason?: string;
}

export type PhotoAnalysisInterpretationCode =
  | "retake_needed"
  | "urgent_review"
  | "professional_review"
  | "barrier_support"
  | "acne_progress_timing"
  | "hyperpigmentation_tracking"
  | "retinoid_irritation_context"
  | "stable_baseline";

export type PhotoAnalysisInterpretationSeverity =
  | "info"
  | "warning"
  | "critical";

export type PhotoAnalysisEvidenceGrade = "strong" | "moderate" | "limited";

export interface PhotoAnalysisSourceCitation {
  id: string;
  title_key: string;
  organization: string;
  summary_key: string;
  url: string;
  evidence_grade: PhotoAnalysisEvidenceGrade;
  last_verified: string;
}

export enum PhotoAnalysisReadingLabel {
  Useful = "useful",
  Limited = "limited",
  NeedsRetake = "needs_retake",
}

export enum PhotoAnalysisConcernReadLabel {
  LikelyVisible = "likely_visible",
  Possible = "possible",
  Limited = "limited",
}

export interface PhotoAnalysisTextRef {
  key: string;
  values?: Record<string, string | number>;
}

export interface PhotoAnalysisReadingQuality {
  visual_label: PhotoAnalysisReadingLabel;
  trend_label: PhotoAnalysisReadingLabel;
  reason_keys: PhotoAnalysisTextRef[];
}

export interface PhotoAnalysisConcernGuidance {
  concern: AnalysisConcern;
  severity: "mild" | "moderate" | "severe";
  locations: string[];
  confidence_label: PhotoAnalysisConcernReadLabel;
  title_key: string;
  summary: PhotoAnalysisTextRef;
  possible_factor_keys: PhotoAnalysisTextRef[];
  possible_cause_items?: string[];
  action_keys: PhotoAnalysisTextRef[];
  try_next_items?: string[];
  avoid_keys: PhotoAnalysisTextRef[];
  avoid_items?: string[];
  track_key: PhotoAnalysisTextRef;
  escalation_key?: PhotoAnalysisTextRef | null;
  source_ids: string[];
  sources: PhotoAnalysisSourceCitation[];
}

export enum PhotoAnalysisInterpretationVersion {
  V1_0 = "1.0",
  V1_1 = "1.1",
}

export interface PhotoAnalysisInterpretation {
  version: PhotoAnalysisInterpretationVersion;
  code: PhotoAnalysisInterpretationCode;
  severity: PhotoAnalysisInterpretationSeverity;
  summary_key: string;
  summary_values: Record<string, string | number>;
  guidance_keys: string[];
  caveat_keys: string[];
  source_ids: string[];
  sources: PhotoAnalysisSourceCitation[];
  generated_at: string;
  reading_quality?: PhotoAnalysisReadingQuality;
  concern_guidance?: PhotoAnalysisConcernGuidance[];
}
