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

export interface AnalysisObservations {
  schema_version: "1.0" | "1.1";
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
  user_visible_message?: string;
  safety_flags?: {
    urgent_review_recommended: boolean;
    doctor_follow_up_recommended: boolean;
    reasons: AnalysisSafetyReason[];
  };
  should_flag_for_doctor: boolean;
  doctor_flag_reason?: string;
}
