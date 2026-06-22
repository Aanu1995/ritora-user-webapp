import { z } from "@/lib/zod";
import type {
  OnDemandSuggestionIntensity,
  OnDemandSuggestionIntent,
} from "@/types/suggestions";

const INTENT_VALUES: [
  OnDemandSuggestionIntent,
  ...OnDemandSuggestionIntent[],
] = [
  "post_workout",
  "post_sun",
  "post_swim",
  "travel_refresh",
  "quick_refresh",
  "event_prep",
  "post_makeup_or_shower",
  "other",
];

const INTENSITY_VALUES: [
  OnDemandSuggestionIntensity,
  ...OnDemandSuggestionIntensity[],
] = ["minimal", "standard"];

export const onDemandSuggestionSchema = z.object({
  intent: z.enum(INTENT_VALUES),
  intensity: z.enum(INTENSITY_VALUES),
  note: z.string().max(280, "noteTooLong").optional(),
});

export type OnDemandSuggestionValues = z.infer<
  typeof onDemandSuggestionSchema
>;

export const onDemandSuggestionDefaultValues: OnDemandSuggestionValues = {
  intent: "post_workout",
  intensity: "minimal",
  note: "",
};
