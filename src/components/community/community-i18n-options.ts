"use client";

import { useTranslations } from "next-intl";
import { safeDynamicTranslation } from "@/components/skin-journal/safe-translation";
import {
  avoidTagOptions,
  communityConcernOptions,
  communityDisclosureTypes,
  communityGoalOptions,
  communityMinimumRatingOptions,
  communityReviewRoutineContextUsages,
  communitySensitivityOptions,
  communitySkinTypeOptions,
  didNotWorkTagOptions,
  goalResultOptions,
  goalTimeframeOptions,
  habitTagOptions,
  outcomeFollowedPartOptions,
  outcomeIrritationOptions,
  outcomeSignalOptions,
  outcomeTrialDurationOptions,
  productCategoryOptions,
  reviewFrequencyOptions,
  reviewOutcomeFollowedPartOptions,
  reviewRepurchaseOptions,
  reviewRoutineSlotOptions,
  reviewSkinResponseOptions,
  reviewUsageDurationOptions,
  warningTagOptions,
} from "./community-constants";

type Option<TValue extends string = string> = {
  value: TValue;
  label: string;
};

type CommunityOptionKey = `${string}.${string}`;
type CommunityOptionTranslator = (key: CommunityOptionKey) => string;

export function useCommunityTranslatedOptions() {
  const t = useTranslations("community.options");
  const translate = t as CommunityOptionTranslator;
  const facetLabel = useCommunityFacetLabel();
  const localize = <TValue extends string>(
    options: readonly { value: TValue }[],
    group: string,
  ): Option<TValue>[] =>
    options.map((option) => ({
      value: option.value,
      label: translate(`${group}.${option.value}`),
    }));

  return {
    avoidTags: localize(avoidTagOptions, "avoidTag"),
    concerns: communityConcernOptions.map((option) => ({
      value: option.value,
      label: facetLabel(option.value),
    })),
    didNotWorkTags: localize(didNotWorkTagOptions, "didNotWorkTag"),
    disclosures: communityDisclosureTypes.map((value) => ({
      value,
      label: translate(`disclosure.${value}`),
    })),
    disclosureDescriptions: communityDisclosureTypes.map((value) => ({
      value,
      label: translate(`disclosureDescription.${value}`),
    })),
    goalResults: localize(goalResultOptions, "goalResult"),
    goalTimeframes: localize(goalTimeframeOptions, "goalTimeframe"),
    goals: localize(communityGoalOptions, "goal"),
    habits: localize(habitTagOptions, "habitTag"),
    minimumRatings: communityMinimumRatingOptions.map((option) => ({
      value: option.value,
      label: translate(`minimumRating.${option.value}`),
    })),
    outcomeFollowedParts: localize(
      outcomeFollowedPartOptions,
      "outcomeFollowedPart",
    ),
    reviewOutcomeFollowedParts: localize(
      reviewOutcomeFollowedPartOptions,
      "reviewOutcomeFollowedPart",
    ),
    outcomeIrritations: localize(outcomeIrritationOptions, "outcomeIrritation"),
    outcomeSignals: localize(outcomeSignalOptions, "outcomeSignal"),
    outcomeTrialDurations: localize(
      outcomeTrialDurationOptions,
      "outcomeTrialDuration",
    ),
    productCategories: localize(productCategoryOptions, "productCategory"),
    reviewFrequencies: localize(reviewFrequencyOptions, "reviewFrequency"),
    reviewRepurchases: localize(reviewRepurchaseOptions, "reviewRepurchase"),
    reviewRoutineContextUsages: localize(
      communityReviewRoutineContextUsages.map((value) => ({ value })),
      "reviewRoutineContextUsage",
    ),
    reviewRoutineSlots: localize(reviewRoutineSlotOptions, "reviewRoutineSlot"),
    reviewSkinResponses: localize(
      reviewSkinResponseOptions,
      "reviewSkinResponse",
    ),
    reviewUsageDurations: localize(
      reviewUsageDurationOptions,
      "reviewUsageDuration",
    ),
    sensitivities: communitySensitivityOptions.map((option) => ({
      value: option.value,
      label: facetLabel(option.value),
    })),
    skinTypes: communitySkinTypeOptions.map((option) => ({
      value: option.value,
      label: facetLabel(option.value),
    })),
    warnings: localize(warningTagOptions, "warningTag"),
  };
}

export function useCommunityFacetLabel() {
  const tCommunityFacet = useTranslations("community.options.safeFacet");
  const tSkinProfileOption = useTranslations("skinProfile.options");

  return (value: string): string => {
    const fallback = humaniseCommunityTag(value);
    const communityLabel = safeDynamicTranslation(tCommunityFacet, value, "");

    if (communityLabel) {
      return communityLabel;
    }

    return safeDynamicTranslation(tSkinProfileOption, value, fallback);
  };
}

export function labelFromOptions(
  options: readonly Option[],
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? null;
}

export function humaniseCommunityTag(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
