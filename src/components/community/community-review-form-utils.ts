import { communityReviewRatingValues } from "./community-constants";

export type ReviewTextFieldName =
  | "contextProductBrand"
  | "contextProductName"
  | "outcomes"
  | "productBrand"
  | "productName";

export type ReviewSelectFieldName =
  | "contextCategory"
  | "effectivenessRating"
  | "frequency"
  | "irritationRating"
  | "overallRating"
  | "productCategory"
  | "repurchase"
  | "routineSlot"
  | "skinResponse"
  | "textureRating"
  | "usageDuration"
  | "valueRating";

export type SelectOption = {
  value: string;
  label: string;
};

export const ratingOptions: SelectOption[] = communityReviewRatingValues.map(
  (value) => ({ value, label: `${value} / 5` }),
);

export function toRequiredRating(value: string): number {
  return Number.parseInt(value, 10);
}

export function toOptionalRating(value: string): number | null {
  return value.length > 0 ? Number.parseInt(value, 10) : null;
}

export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
