"use client";

import { Check, ChevronDown, Clock3, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";
import {
  DAYPART_FILTERS,
  MODE_FILTERS,
  SOURCE_FILTERS,
  STATUS_FILTERS,
  type HistoryFilterOption,
} from "./history-filter-options";

type FilterDropdownProps = {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
};

export function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-border" />;
}

export function DaypartDropdown({ value, onChange }: FilterDropdownProps) {
  const active = value.daypart ?? null;
  return (
    <FilterMenu
      ariaKey="daypart"
      allKey="daypart_all"
      active={active}
      fallbackIcon={Clock3}
      options={DAYPART_FILTERS}
      onClear={() => onChange({ ...value, daypart: undefined })}
      onSelect={(daypart) => onChange({ ...value, daypart })}
    />
  );
}

export function StatusDropdown({ value, onChange }: FilterDropdownProps) {
  const active = value.status ?? null;
  return (
    <FilterMenu
      ariaKey="status"
      allKey="status_all"
      active={active}
      fallbackIcon={Check}
      options={STATUS_FILTERS}
      onClear={() => onChange({ ...value, status: undefined })}
      onSelect={(status) => onChange({ ...value, status })}
    />
  );
}

export function ModeDropdown({ value, onChange }: FilterDropdownProps) {
  const active = value.mode ?? null;
  return (
    <FilterMenu
      ariaKey="mode"
      allKey="mode_all"
      active={active}
      fallbackIcon={Sparkles}
      options={MODE_FILTERS}
      onClear={() => onChange({ ...value, mode: undefined })}
      onSelect={(mode) => onChange({ ...value, mode })}
    />
  );
}

export function SourceDropdown({ value, onChange }: FilterDropdownProps) {
  const active = value.requestSource ?? null;
  return (
    <FilterMenu
      ariaKey="source"
      allKey="source_all"
      active={active}
      fallbackIcon={Zap}
      options={SOURCE_FILTERS}
      onClear={() => onChange({ ...value, requestSource: undefined })}
      onSelect={(requestSource) => onChange({ ...value, requestSource })}
    />
  );
}

function FilterMenu<TValue extends string>({
  active,
  ariaKey,
  allKey,
  fallbackIcon: FallbackIcon,
  options,
  onClear,
  onSelect,
}: {
  active: TValue | null;
  ariaKey: string;
  allKey: string;
  fallbackIcon: HistoryFilterOption["Icon"];
  options: ReadonlyArray<HistoryFilterOption & { value: TValue }>;
  onClear: () => void;
  onSelect: (value: TValue) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const activeOption = options.find((option) => option.value === active);
  const TriggerIcon = activeOption?.Icon ?? FallbackIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t(ariaKey)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            active
              ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-foreground hover:bg-accent-soft",
          )}
        >
          <TriggerIcon
            className={cn(
              "h-3 w-3",
              active ? "text-accent-strong" : "text-muted",
            )}
          />
          {activeOption ? t(activeOption.labelKey) : t(ariaKey)}
          <ChevronDown
            className={cn(
              "h-3 w-3",
              active ? "text-accent-strong" : "text-muted",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[220px] p-1">
        <div className="flex flex-col">
          {active ? (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-accent-soft"
            >
              <span className="font-medium text-muted">{t(allKey)}</span>
            </button>
          ) : null}
          {options.map(({ value, labelKey, Icon }) => {
            const isActive = active === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onSelect(value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-accent-soft",
                )}
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <Icon className="h-3.5 w-3.5 text-muted" />
                  {t(labelKey)}
                </span>
                {isActive ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
