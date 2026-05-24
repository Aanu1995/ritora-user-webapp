"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunityTranslatedOptions } from "./community-i18n-options";

/* ===========================================================
 * Sentinel for "no filter applied". Radix Select can't accept
 * an empty string as an item value, so we use a non-empty
 * sentinel and translate it back to "" on the way out.
 * ========================================================= */
const ALL = "__all__";

export type CommunityPlaybookFilterState = {
  avoidTag: string;
  goal: string;
  habitTag: string;
  productRole: string;
  result: string;
  timeframe: string;
  warningTag: string;
};

export const emptyPlaybookFilters: CommunityPlaybookFilterState = {
  avoidTag: "",
  goal: "",
  habitTag: "",
  productRole: "",
  result: "",
  timeframe: "",
  warningTag: "",
};

export function CommunityPlaybookFilters({
  onChange,
  value,
}: {
  onChange: (next: CommunityPlaybookFilterState) => void;
  value: CommunityPlaybookFilterState;
}) {
  const t = useTranslations("community.filters");
  const options = useCommunityTranslatedOptions();
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-3">
      <FilterSelect
        allLabel={t("all")}
        label={t("goal")}
        options={options.goals}
        value={value.goal}
        onChange={(goal) => onChange({ ...value, goal })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("result")}
        options={options.goalResults}
        value={value.result}
        onChange={(result) => onChange({ ...value, result })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("timeframe")}
        options={options.goalTimeframes}
        value={value.timeframe}
        onChange={(timeframe) => onChange({ ...value, timeframe })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("productRole")}
        options={options.productCategories}
        value={value.productRole}
        onChange={(productRole) => onChange({ ...value, productRole })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("avoided")}
        options={options.avoidTags}
        value={value.avoidTag}
        onChange={(avoidTag) => onChange({ ...value, avoidTag })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("habit")}
        options={options.habits}
        value={value.habitTag}
        onChange={(habitTag) => onChange({ ...value, habitTag })}
      />
      <FilterSelect
        allLabel={t("all")}
        label={t("warning")}
        options={options.warnings}
        value={value.warningTag}
        onChange={(warningTag) => onChange({ ...value, warningTag })}
      />
    </div>
  );
}

function FilterSelect({
  allLabel,
  label,
  onChange,
  options,
  value,
}: {
  allLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted">{label}</Label>
      <Select
        value={value === "" ? ALL : value}
        onValueChange={(next) => onChange(next === ALL ? "" : next)}
      >
        <SelectTrigger className="h-10 rounded-lg px-3 py-2 text-sm">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
