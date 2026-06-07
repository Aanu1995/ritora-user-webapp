export enum AnalysisFeedbackVote {
  Helpful = "helpful",
  NotHelpful = "not_helpful",
}

export enum AnalysisFeedbackReason {
  TooGeneric = "too_generic",
  WrongConcern = "wrong_concern",
  WrongLocation = "wrong_location",
  MissedContext = "missed_context",
  NotActionable = "not_actionable",
  PhotoQualityConfusing = "photo_quality_confusing",
  SourcesNotUseful = "sources_not_useful",
  Other = "other",
}

export const ANALYSIS_FEEDBACK_REASONS: readonly AnalysisFeedbackReason[] = [
  AnalysisFeedbackReason.TooGeneric,
  AnalysisFeedbackReason.WrongConcern,
  AnalysisFeedbackReason.WrongLocation,
  AnalysisFeedbackReason.MissedContext,
  AnalysisFeedbackReason.NotActionable,
  AnalysisFeedbackReason.PhotoQualityConfusing,
  AnalysisFeedbackReason.SourcesNotUseful,
  AnalysisFeedbackReason.Other,
];

export interface AnalysisFeedback {
  vote: AnalysisFeedbackVote;
  reason: AnalysisFeedbackReason | null;
  note: string | null;
  interpretation_version: string | null;
  reading_label: string | null;
  created_at: string;
  updated_at: string;
}
