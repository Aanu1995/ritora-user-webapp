export type ReactionReportSymptom =
  | "burning"
  | "stinging"
  | "itching"
  | "tightness"
  | "redness"
  | "heat"
  | "pain"
  | "swelling"
  | "hives"
  | "peeling"
  | "breakout"
  | "other";

export const REACTION_REPORT_SYMPTOMS: ReactionReportSymptom[] = [
  "burning",
  "stinging",
  "itching",
  "tightness",
  "redness",
  "heat",
  "pain",
  "swelling",
  "hives",
  "peeling",
  "breakout",
  "other",
];

export type ReactionReportSeverity = "mild" | "moderate" | "severe";

export const REACTION_REPORT_SEVERITIES: ReactionReportSeverity[] = [
  "mild",
  "moderate",
  "severe",
];

export type ReactionReportOnset =
  | "today"
  | "yesterday"
  | "two_to_three_days"
  | "four_to_seven_days"
  | "more_than_week"
  | "unsure";

export const REACTION_REPORT_ONSETS: ReactionReportOnset[] = [
  "today",
  "yesterday",
  "two_to_three_days",
  "four_to_seven_days",
  "more_than_week",
  "unsure",
];

export type ReactionReportLocation =
  | "forehead"
  | "cheeks"
  | "chin_jaw"
  | "around_mouth"
  | "eye_area"
  | "neck"
  | "all_over_face"
  | "body"
  | "other";

export const REACTION_REPORT_LOCATIONS: ReactionReportLocation[] = [
  "forehead",
  "cheeks",
  "chin_jaw",
  "around_mouth",
  "eye_area",
  "neck",
  "all_over_face",
  "body",
  "other",
];

export type ReactionReportRedFlag =
  | "eye_or_lip_swelling"
  | "trouble_breathing"
  | "blistering"
  | "open_skin"
  | "spreading_fast"
  | "severe_pain"
  | "infection_signs";

export const REACTION_REPORT_RED_FLAGS: ReactionReportRedFlag[] = [
  "eye_or_lip_swelling",
  "trouble_breathing",
  "blistering",
  "open_skin",
  "spreading_fast",
  "severe_pain",
  "infection_signs",
];

export type ReactionReportTrigger =
  | "new_product"
  | "changed_frequency"
  | "active_ingredient"
  | "sunscreen"
  | "treatment"
  | "weather_or_environment"
  | "unknown";

export const REACTION_REPORT_TRIGGERS: ReactionReportTrigger[] = [
  "new_product",
  "changed_frequency",
  "active_ingredient",
  "sunscreen",
  "treatment",
  "weather_or_environment",
  "unknown",
];

export interface ReactionReport {
  symptoms: ReactionReportSymptom[];
  severity: ReactionReportSeverity;
  onset?: ReactionReportOnset | null;
  locations?: ReactionReportLocation[];
  red_flags?: ReactionReportRedFlag[];
  suspected_trigger?: ReactionReportTrigger | null;
  note?: string | null;
}
