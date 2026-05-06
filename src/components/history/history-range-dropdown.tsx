"use client";

import { Calendar, Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

type Props = {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
};

export function RangeDropdown({ value, onChange }: Props) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"presets" | "custom">("presets");
  const [fromDraft, setFromDraft] = useState(value.fromDate ?? "");
  const [toDraft, setToDraft] = useState(value.toDate ?? "");

  const today = new Date();
  const todayIso = formatDateInput(today);
  const activeRange = value.range ?? "7d";
  const isCustomActive =
    activeRange === "custom" &&
    Boolean(value.fromDate) &&
    Boolean(value.toDate);
  const isValidDraft =
    Boolean(fromDraft) &&
    Boolean(toDraft) &&
    fromDraft <= toDraft &&
    fromDraft <= todayIso &&
    toDraft <= todayIso;
  const triggerLabel = buildTriggerLabel(value, activeRange, isCustomActive, t);
  const presets: ReadonlyArray<{
    key: "7d" | "30d" | "custom";
    label: string;
  }> = [
    { key: "7d", label: t("last7d") },
    { key: "30d", label: t("last30d") },
    { key: "custom", label: t("custom") },
  ];

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setFromDraft(value.fromDate ?? "");
          setToDraft(value.toDate ?? "");
          setView(activeRange === "custom" ? "custom" : "presets");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("range")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            "border-border bg-surface text-foreground hover:bg-surface-muted",
            isCustomActive &&
              "border-[color:var(--accent)] bg-accent-soft text-accent-strong",
          )}
        >
          <Calendar className="h-3 w-3 text-muted" />
          {triggerLabel}
          <ChevronDown className="h-3 w-3 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] p-1">
        <div className="flex flex-col">
          {presets.map((preset) => (
            <PresetButton
              key={preset.key}
              label={preset.label}
              isActive={isPresetActive(preset.key, activeRange, isCustomActive)}
              onClick={() => {
                if (preset.key === "custom") {
                  setView("custom");
                  return;
                }
                onChange({
                  ...value,
                  range: preset.key,
                  fromDate: undefined,
                  toDate: undefined,
                });
                setOpen(false);
              }}
            />
          ))}

          {view === "custom" ? (
            <CustomRangeEditor
              fromDraft={fromDraft}
              toDraft={toDraft}
              today={today}
              isValidDraft={isValidDraft}
              onFromChange={setFromDraft}
              onToChange={setToDraft}
              onClear={() => {
                setFromDraft("");
                setToDraft("");
                onChange({
                  ...value,
                  range: "7d",
                  fromDate: undefined,
                  toDate: undefined,
                });
                setOpen(false);
              }}
              onApply={() => {
                if (!isValidDraft) return;
                onChange({
                  ...value,
                  range: "custom",
                  fromDate: fromDraft,
                  toDate: toDraft,
                });
                setOpen(false);
              }}
            />
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PresetButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
        isActive
          ? "bg-accent-soft text-accent-strong"
          : "hover:bg-surface-muted",
      )}
    >
      <span className="font-medium">{label}</span>
      {isActive ? <Check className="h-4 w-4" /> : null}
    </button>
  );
}

function CustomRangeEditor(props: {
  fromDraft: string;
  toDraft: string;
  today: Date;
  isValidDraft: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const t = useTranslations("history.filters");
  const { fromDraft, toDraft, today, isValidDraft } = props;
  return (
    <div className="mt-2 space-y-2 border-t border-border px-2 pt-3 pb-2">
      <DateField
        label={t("from")}
        value={fromDraft}
        maxDate={today}
        onChange={props.onFromChange}
      />
      <DateField
        label={t("to")}
        value={toDraft}
        maxDate={today}
        onChange={props.onToChange}
      />
      {fromDraft && toDraft && fromDraft > toDraft ? (
        <p className="text-xs text-danger">{t("rangeInvalid")}</p>
      ) : null}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={props.onClear}>
          {t("clear")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!isValidDraft}
          onClick={props.onApply}
        >
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  maxDate,
  onChange,
}: {
  label: string;
  value: string;
  maxDate: Date;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <DatePicker
        value={value}
        onChange={onChange}
        ariaLabel={label}
        allowClear
        maxDate={maxDate}
      />
    </div>
  );
}

function buildTriggerLabel(
  value: SuggestionHistoryListQuery,
  activeRange: SuggestionHistoryListQuery["range"],
  isCustomActive: boolean,
  t: (key: string) => string,
): string {
  if (isCustomActive && value.fromDate && value.toDate) {
    return `${formatShortDate(value.fromDate)} - ${formatShortDate(value.toDate)}`;
  }
  return activeRange === "30d" ? t("last30d") : t("last7d");
}

function isPresetActive(
  preset: "7d" | "30d" | "custom",
  activeRange: SuggestionHistoryListQuery["range"],
  isCustomActive: boolean,
): boolean {
  return preset === "custom"
    ? isCustomActive
    : activeRange === preset && !isCustomActive;
}

function formatDateInput(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(`${iso}T00:00:00`));
  } catch {
    return iso;
  }
}
