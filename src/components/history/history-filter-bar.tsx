"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DaypartDropdown,
  Divider,
  ModeDropdown,
  StatusDropdown,
} from "@/components/history/history-filter-dropdowns";
import { RangeDropdown } from "@/components/history/history-range-dropdown";
import { cn } from "@/lib/utils";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

type Props = {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
};

export function HistoryFilterBar({ value, onChange }: Props) {
  const t = useTranslations("history.filters");
  const update = (next: SuggestionHistoryListQuery) =>
    onChange({ ...next, cursor: undefined });

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <RangeDropdown value={value} onChange={update} />
      <Divider />
      <DaypartDropdown value={value} onChange={update} />
      <Divider />
      <ModeDropdown value={value} onChange={update} />
      <Divider />
      <StatusDropdown value={value} onChange={update} />
      <EditedToggle value={value} onChange={update} label={t("edited")} />
    </div>
  );
}

function EditedToggle({
  value,
  onChange,
  label,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
  label: string;
}) {
  const isActive = value.hasBeenEdited === true;
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() =>
        onChange({
          ...value,
          hasBeenEdited: isActive ? undefined : true,
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        isActive
          ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
          : "border-border bg-surface text-foreground hover:bg-accent-soft",
      )}
    >
      <Pencil
        className={cn(
          "h-3 w-3",
          isActive ? "text-accent-strong" : "text-muted",
        )}
      />
      {label}
    </button>
  );
}
