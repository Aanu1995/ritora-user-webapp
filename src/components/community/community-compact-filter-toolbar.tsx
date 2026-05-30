"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  CommunityFilterPanel,
  FilterSelect,
  type CommunityFilterOption,
} from "./community-filter-fields";

const ALL_OPTION = "__all__";

export type CompactFilterDefinition<TFilters> = {
  key: keyof TFilters & string;
  label: string;
  options: readonly CommunityFilterOption[];
};

type CompactFilterToolbarProps<TFilters extends Record<string, string>> = {
  activeCount: number;
  anyActive: boolean;
  ariaLabel: string;
  countLabel?: string;
  emptyValue: TFilters;
  inlineFilters: readonly CompactFilterDefinition<TFilters>[];
  onChange: (next: TFilters) => void;
  sheetDescription: string;
  sheetFilters: readonly CompactFilterDefinition<TFilters>[];
  sheetTitle: string;
  value: TFilters;
};

export function CommunityInlineSearchField({
  ariaLabel,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  onChange: (next: string) => void;
  placeholder: string;
  value: string;
}) {
  const t = useTranslations("community.filters");
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-md">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
      <Input
        type="search"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-lg bg-surface pl-9 pr-8 text-sm"
      />
      {value ? (
        <button
          type="button"
          aria-label={t("clear")}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function CommunityCompactFilterToolbar<
  TFilters extends Record<string, string>,
>({
  activeCount,
  anyActive,
  ariaLabel,
  countLabel,
  emptyValue,
  inlineFilters,
  onChange,
  sheetDescription,
  sheetFilters,
  sheetTitle,
  value,
}: CompactFilterToolbarProps<TFilters>) {
  const t = useTranslations("community.filters");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftValue, setDraftValue] = useState<TFilters>(value);
  const updateInlineFilter = (key: keyof TFilters & string, nextValue: string) =>
    onChange({ ...value, [key]: nextValue } as TFilters);
  const updateDraftFilter = (key: keyof TFilters & string, nextValue: string) =>
    setDraftValue((current) => ({ ...current, [key]: nextValue }) as TFilters);
  const sheetFilterKeys = new Set(sheetFilters.map((filter) => filter.key));
  const draftActiveCount = [...sheetFilterKeys].reduce(
    (sum, key) => (draftValue[key] ? sum + 1 : sum),
    0,
  );
  const sheetTriggerLabel = activeCount
    ? t("filtersWithCount", { count: activeCount })
    : t("filtersAll");
  const openSheet = () => {
    setDraftValue(value);
    setSheetOpen(true);
  };
  const handleSheetOpenChange = (open: boolean) => {
    if (open) {
      setDraftValue(value);
    }
    setSheetOpen(open);
  };
  const applyDraftFilters = () => {
    onChange(draftValue);
    setSheetOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex min-w-0 items-center gap-2 sm:flex-1">
        <div
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={ariaLabel}
        >
          {inlineFilters.map((filter) => (
            <InlineFilterPill
              key={filter.key}
              label={filter.label}
              allLabel={t("all")}
              value={value[filter.key]}
              options={filter.options}
              onChange={(next) => updateInlineFilter(filter.key, next)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={openSheet}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition",
            activeCount > 0
              ? "border-accent/40 bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          {sheetTriggerLabel}
        </button>
      </div>

      <ToolbarMeta
        anyActive={anyActive}
        countLabel={countLabel}
        onClear={() => onChange(emptyValue)}
      />

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
          <div className="space-y-1 border-b border-border py-4 pl-4 pr-12 sm:pl-6 sm:pr-14">
            <SheetTitle className="font-display text-base font-bold text-foreground">
              {sheetTitle}
            </SheetTitle>
            <SheetDescription className="text-xs leading-5 text-muted">
              {sheetDescription}
            </SheetDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <CommunityFilterPanel onClear={() => setDraftValue(emptyValue)}>
              {sheetFilters.map((filter) => (
                <FilterSelect
                  key={filter.key}
                  allLabel={t("all")}
                  label={filter.label}
                  options={filter.options}
                  value={draftValue[filter.key]}
                  onChange={(next) => updateDraftFilter(filter.key, next)}
                />
              ))}
            </CommunityFilterPanel>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3 sm:px-6">
            <span className="text-xs text-muted">
              {t("activeFiltersLabel", { count: draftActiveCount })}
            </span>
            <Button type="button" size="sm" onClick={applyDraftFilters}>
              {t("done")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ToolbarMeta({
  anyActive,
  countLabel,
  onClear,
}: {
  anyActive: boolean;
  countLabel?: string;
  onClear: () => void;
}) {
  const t = useTranslations("community.filters");
  if (!countLabel && !anyActive) return null;
  return (
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      {countLabel ? (
        <span className="shrink-0 whitespace-nowrap text-xs font-medium tabular-nums text-muted">
          {countLabel}
        </span>
      ) : (
        <span aria-hidden />
      )}
      {anyActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-mr-2 shrink-0 whitespace-nowrap px-2 text-muted hover:text-foreground"
          onClick={onClear}
        >
          {t("clearAll")}
        </Button>
      ) : null}
    </div>
  );
}

function InlineFilterPill({
  allLabel,
  label,
  onChange,
  options,
  value,
}: {
  allLabel: string;
  label: string;
  onChange: (next: string) => void;
  options: readonly CommunityFilterOption[];
  value: string;
}) {
  const active = Boolean(value);
  const selectedLabel = active
    ? (options.find((option) => option.value === value)?.label ?? value)
    : null;

  return (
    <Select
      value={value === "" ? ALL_OPTION : value}
      onValueChange={(next) => onChange(next === ALL_OPTION ? "" : next)}
    >
      <SelectTrigger
        aria-label={label}
        /* Pill-styled trigger. Three overrides worth calling
           out explicitly:
           - `[&_svg]:h-3 [&_svg]:w-3`: the styled SelectTrigger
             appends its ChevronDown internally with hardcoded
             `h-4 w-4`. That 16px icon looked oversized next to
             our 12px `text-xs` label. The descendant selector
             shrinks the icon without needing to touch the
             shared SelectTrigger primitive.
           - `[&_svg]:text-current`: the SelectTrigger's
             ChevronDown also hardcodes `text-muted`. Forcing
             `text-current` makes the chevron inherit the pill's
             tone — muted when inactive, accent-strong when
             active. Without this the active pill had a
             pleasant accent label but a stale muted chevron.
           - `[&_svg]:opacity-60`: gently de-emphasizes the
             chevron so the label reads first, the chevron
             reads second.
           - `data-[state=open]:[&_svg]:rotate-180`: rotates
             the chevron when the menu opens — matches native
             dropdown affordance and signals which pill is
             currently open. */
        className={cn(
          "h-auto w-auto shrink-0 gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium [&_svg]:h-3 [&_svg]:w-3 [&_svg]:text-current [&_svg]:opacity-60 data-[state=open]:[&_svg]:rotate-180 [&_svg]:transition-transform",
          active
            ? "border-accent/40 bg-accent-soft text-accent-strong hover:bg-accent-soft/80"
            : "bg-surface text-muted hover:border-border-strong hover:text-foreground",
        )}
      >
        <span>{selectedLabel ? `${label}: ${selectedLabel}` : label}</span>
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[10rem]">
        <SelectItem value={ALL_OPTION}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
