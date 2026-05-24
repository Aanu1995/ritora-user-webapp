"use client";

import { useTranslations } from "next-intl";
import {
  avoidTagOptions,
  communityDisclosureTypes,
  communityGoalOptions,
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
    outcomeFollowedParts: localize(
      outcomeFollowedPartOptions,
      "outcomeFollowedPart",
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
    reviewRoutineSlots: localize(reviewRoutineSlotOptions, "reviewRoutineSlot"),
    reviewSkinResponses: localize(
      reviewSkinResponseOptions,
      "reviewSkinResponse",
    ),
    reviewUsageDurations: localize(
      reviewUsageDurationOptions,
      "reviewUsageDuration",
    ),
    warnings: localize(warningTagOptions, "warningTag"),
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
