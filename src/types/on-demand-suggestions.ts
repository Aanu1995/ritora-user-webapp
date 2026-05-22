export type SuggestionRequestSource = "scheduled" | "on_demand";
export const SUGGESTION_REQUEST_SOURCES = [
  "scheduled",
  "on_demand",
] as const satisfies readonly SuggestionRequestSource[];

export type OnDemandSuggestionIntent =
  | "post_workout"
  | "post_sun"
  | "post_swim"
  | "travel_refresh"
  | "quick_refresh"
  | "event_prep"
  | "post_makeup_or_shower"
  | "other";

export const ON_DEMAND_SUGGESTION_INTENTS = [
  "post_workout",
  "post_sun",
  "post_swim",
  "travel_refresh",
  "quick_refresh",
  "event_prep",
  "post_makeup_or_shower",
  "other",
] as const satisfies readonly OnDemandSuggestionIntent[];

export type OnDemandSuggestionIntensity = "minimal" | "standard";
export const ON_DEMAND_SUGGESTION_INTENSITIES = [
  "minimal",
  "standard",
] as const satisfies readonly OnDemandSuggestionIntensity[];

export type SuggestionRequestContext = {
  intent: OnDemandSuggestionIntent;
  intensity: OnDemandSuggestionIntensity;
  note: string | null;
  activityAt: string | null;
  requestedAt: string;
};

export type CreateOnDemandSuggestionPayload = {
  intent: OnDemandSuggestionIntent;
  intensity?: OnDemandSuggestionIntensity;
  note?: string;
  activityAt?: string | null;
  requestId?: string;
};
