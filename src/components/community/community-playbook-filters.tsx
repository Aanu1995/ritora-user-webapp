"use client";

import { useTranslations } from "next-intl";
import {
  CommunityCompactFilterToolbar,
  CommunityInlineSearchField,
  type CompactFilterDefinition,
} from "./community-compact-filter-toolbar";
import { useCommunityTranslatedOptions } from "./community-i18n-options";

export type CommunityPlaybookFilterState = {
  avoidTag: string;
  concern: string;
  disclosureType: string;
  goal: string;
  habitTag: string;
  productRole: string;
  result: string;
  search: string;
  sensitivity: string;
  skinType: string;
  timeframe: string;
  warningTag: string;
};

export const emptyPlaybookFilters: CommunityPlaybookFilterState = {
  avoidTag: "",
  concern: "",
  disclosureType: "",
  goal: "",
  habitTag: "",
  productRole: "",
  result: "",
  search: "",
  sensitivity: "",
  skinType: "",
  timeframe: "",
  warningTag: "",
};

const countedPlaybookFilterKeys: ReadonlyArray<
  keyof CommunityPlaybookFilterState
> = [
  "avoidTag",
  "concern",
  "disclosureType",
  "goal",
  "habitTag",
  "productRole",
  "result",
  "sensitivity",
  "skinType",
  "timeframe",
  "warningTag",
];

export function hasActivePlaybookFilters(
  filters: CommunityPlaybookFilterState,
): boolean {
  return Object.values(filters).some(Boolean);
}

export function countActivePlaybookFilters(
  filters: CommunityPlaybookFilterState,
): number {
  return countedPlaybookFilterKeys.reduce(
    (sum, key) => (filters[key] ? sum + 1 : sum),
    0,
  );
}

export function PlaybookSearchField({
  onChange,
  value,
}: {
  onChange: (next: string) => void;
  value: string;
}) {
  const t = useTranslations("community.filters");
  return (
    <CommunityInlineSearchField
      ariaLabel={t("searchPlaybooks")}
      placeholder={t("searchPlaybooksPlaceholder")}
      value={value}
      onChange={onChange}
    />
  );
}

export function PlaybookCompactToolbar({
  countLabel,
  onChange,
  value,
}: {
  countLabel?: string;
  onChange: (next: CommunityPlaybookFilterState) => void;
  value: CommunityPlaybookFilterState;
}) {
  const t = useTranslations("community.filters");
  const options = useCommunityTranslatedOptions();
  const inlineFilters: CompactFilterDefinition<CommunityPlaybookFilterState>[] =
    [
      { key: "concern", label: t("concern"), options: options.concerns },
      { key: "goal", label: t("goal"), options: options.goals },
      { key: "skinType", label: t("skinType"), options: options.skinTypes },
    ];
  const sheetFilters: CompactFilterDefinition<CommunityPlaybookFilterState>[] =
    [
      ...inlineFilters,
      { key: "result", label: t("result"), options: options.goalResults },
      {
        key: "timeframe",
        label: t("timeframe"),
        options: options.goalTimeframes,
      },
      {
        key: "sensitivity",
        label: t("sensitivity"),
        options: options.sensitivities,
      },
      {
        key: "productRole",
        label: t("productRole"),
        options: options.productCategories,
      },
      { key: "avoidTag", label: t("avoided"), options: options.avoidTags },
      { key: "habitTag", label: t("habit"), options: options.habits },
      { key: "warningTag", label: t("warning"), options: options.warnings },
      {
        key: "disclosureType",
        label: t("disclosure"),
        options: options.disclosures,
      },
    ];

  return (
    <CommunityCompactFilterToolbar
      activeCount={countActivePlaybookFilters(value)}
      anyActive={hasActivePlaybookFilters(value)}
      ariaLabel={t("playbooksFiltersTitle")}
      countLabel={countLabel}
      emptyValue={emptyPlaybookFilters}
      inlineFilters={inlineFilters}
      onChange={onChange}
      sheetDescription={t("playbooksFiltersDescription")}
      sheetFilters={sheetFilters}
      sheetTitle={t("playbooksFiltersTitle")}
      value={value}
    />
  );
}
