"use client";

import { useTranslations } from "next-intl";
import {
  CommunityCompactFilterToolbar,
  CommunityInlineSearchField,
  type CompactFilterDefinition,
} from "./community-compact-filter-toolbar";
import { useCommunityTranslatedOptions } from "./community-i18n-options";

export type CommunityReviewFilterState = {
  concern: string;
  contextProductCategory: string;
  disclosureType: string;
  minRating: string;
  productCategory: string;
  resultSignal: string;
  routineContextUsage: string;
  routineSlot: string;
  search: string;
  sensitivity: string;
  skinResponse: string;
  skinType: string;
  usageDuration: string;
};

export const emptyReviewFilters: CommunityReviewFilterState = {
  concern: "",
  contextProductCategory: "",
  disclosureType: "",
  minRating: "",
  productCategory: "",
  resultSignal: "",
  routineContextUsage: "",
  routineSlot: "",
  search: "",
  sensitivity: "",
  skinResponse: "",
  skinType: "",
  usageDuration: "",
};

const countedReviewFilterKeys: ReadonlyArray<
  keyof CommunityReviewFilterState
> = [
  "concern",
  "contextProductCategory",
  "disclosureType",
  "minRating",
  "productCategory",
  "resultSignal",
  "routineContextUsage",
  "routineSlot",
  "sensitivity",
  "skinResponse",
  "skinType",
  "usageDuration",
];

export function hasActiveReviewFilters(
  filters: CommunityReviewFilterState,
): boolean {
  return Object.values(filters).some(Boolean);
}

export function countActiveFilters(
  filters: CommunityReviewFilterState,
): number {
  return countedReviewFilterKeys.reduce(
    (sum, key) => (filters[key] ? sum + 1 : sum),
    0,
  );
}

export function ReviewSearchField({
  onChange,
  value,
}: {
  onChange: (next: string) => void;
  value: string;
}) {
  const t = useTranslations("community.filters");
  return (
    <CommunityInlineSearchField
      ariaLabel={t("searchReviews")}
      placeholder={t("searchReviewsPlaceholder")}
      value={value}
      onChange={onChange}
    />
  );
}

export function ReviewCompactToolbar({
  countLabel,
  onChange,
  value,
}: {
  countLabel?: string;
  onChange: (next: CommunityReviewFilterState) => void;
  value: CommunityReviewFilterState;
}) {
  const t = useTranslations("community.filters");
  const options = useCommunityTranslatedOptions();
  const inlineFilters: CompactFilterDefinition<CommunityReviewFilterState>[] = [
    { key: "concern", label: t("concern"), options: options.concerns },
    {
      key: "minRating",
      label: t("minimumRating"),
      options: options.minimumRatings,
    },
    {
      key: "productCategory",
      label: t("productCategory"),
      options: options.productCategories,
    },
  ];
  const sheetFilters: CompactFilterDefinition<CommunityReviewFilterState>[] = [
    {
      key: "resultSignal",
      label: t("confirmedResult"),
      options: options.outcomeSignals,
    },
    ...inlineFilters.slice(1),
    {
      key: "contextProductCategory",
      label: t("usedWithCategory"),
      options: options.productCategories,
    },
    {
      key: "routineContextUsage",
      label: t("routineContext"),
      options: options.reviewRoutineContextUsages,
    },
    {
      key: "routineSlot",
      label: t("routineSlot"),
      options: options.reviewRoutineSlots,
    },
    {
      key: "skinResponse",
      label: t("skinResponse"),
      options: options.reviewSkinResponses,
    },
    {
      key: "usageDuration",
      label: t("usageDuration"),
      options: options.reviewUsageDurations,
    },
    { key: "skinType", label: t("skinType"), options: options.skinTypes },
    { key: "concern", label: t("concern"), options: options.concerns },
    {
      key: "sensitivity",
      label: t("sensitivity"),
      options: options.sensitivities,
    },
    {
      key: "disclosureType",
      label: t("disclosure"),
      options: options.disclosures,
    },
  ];

  return (
    <CommunityCompactFilterToolbar
      activeCount={countActiveFilters(value)}
      anyActive={hasActiveReviewFilters(value)}
      ariaLabel={t("allFiltersTitle")}
      countLabel={countLabel}
      emptyValue={emptyReviewFilters}
      inlineFilters={inlineFilters}
      onChange={onChange}
      sheetDescription={t("allFiltersDescription")}
      sheetFilters={sheetFilters}
      sheetTitle={t("allFiltersTitle")}
      value={value}
    />
  );
}
