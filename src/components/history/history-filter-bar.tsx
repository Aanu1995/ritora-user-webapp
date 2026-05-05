"use client";

import {
  Calendar,
  CalendarRange,
  Check,
  Circle,
  CircleSlash,
  Clock3,
  Moon,
  Pencil,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
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

const DAYPART_FILTERS = [
  { value: "morning", labelKey: "morning", Icon: Sun },
  { value: "noon", labelKey: "noon", Icon: Clock3 },
  { value: "evening", labelKey: "evening", Icon: Moon },
] as const;

const STATUS_FILTERS = [
  { value: "applied", labelKey: "applied", Icon: Check },
  { value: "partial", labelKey: "partial", Icon: Circle },
  { value: "skipped", labelKey: "skipped", Icon: CircleSlash },
  { value: "simplified", labelKey: "simplified", Icon: Sparkles },
  { value: "missed", labelKey: "missed", Icon: CircleSlash },
] as const;

const MODE_FILTERS = [
  { value: "ai", labelKey: "ai", Icon: Sparkles },
  { value: "manual", labelKey: "manual", Icon: UserRound },
  { value: "mixed", labelKey: "mixed", Icon: Circle },
] as const;

export function HistoryFilterBar({ value, onChange }: Props) {
  const t = useTranslations("history.filters");
  const update = (next: SuggestionHistoryListQuery) =>
    onChange({ ...next, cursor: undefined });
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <FilterChip
        active={value.range === "7d" || !value.range}
        onClick={() => update({ ...value, range: "7d" })}
      >
        <CalendarRange className="h-3 w-3 text-muted" />
        {t("last7d")}
      </FilterChip>
      <FilterChip
        active={value.range === "30d"}
        onClick={() => update({ ...value, range: "30d" })}
      >
        <CalendarRange className="h-3 w-3 text-muted" />
        {t("last30d")}
      </FilterChip>
      <CustomRangePicker value={value} onChange={update} />

      <Divider />

      {DAYPART_FILTERS.map(({ value: daypart, labelKey, Icon }) => (
        <FilterChip
          key={daypart}
          active={value.daypart === daypart}
          onClick={() =>
            update({
              ...value,
              daypart: value.daypart === daypart ? undefined : daypart,
            })
          }
        >
          <Icon className="h-3 w-3 text-muted" />
          {t(labelKey)}
        </FilterChip>
      ))}

      <Divider />

      {MODE_FILTERS.map(({ value: mode, labelKey, Icon }) => (
        <FilterChip
          key={mode}
          active={value.mode === mode}
          onClick={() =>
            update({
              ...value,
              mode: value.mode === mode ? undefined : mode,
            })
          }
        >
          <Icon className="h-3 w-3 text-muted" />
          {t(labelKey)}
        </FilterChip>
      ))}

      <Divider />

      {STATUS_FILTERS.map(({ value: status, labelKey, Icon }) => (
        <FilterChip
          key={status}
          active={value.status === status}
          onClick={() =>
            update({
              ...value,
              status: value.status === status ? undefined : status,
            })
          }
        >
          <Icon className="h-3 w-3 text-muted" />
          {t(labelKey)}
        </FilterChip>
      ))}
      <FilterChip
        active={value.hasBeenEdited === true}
        onClick={() =>
          update({
            ...value,
            hasBeenEdited: value.hasBeenEdited === true ? undefined : true,
          })
        }
      >
        <Pencil className="h-3 w-3 text-muted" />
        {t("edited")}
      </FilterChip>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        active
          ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
          : "border-border bg-surface text-foreground hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-border" />;
}

/**
 * Custom range chip + popover. Clicking the chip opens a popover with two
 * date inputs (from + to). Local draft state lets the user adjust both
 * dates before applying so the list does not refetch on each keystroke.
 *
 * Validation: `to` must be on or after `from`. The Apply button stays
 * disabled until both fields are filled and valid. Clearing resets the
 * range back to `7d`, the default.
 */
function CustomRangePicker({
  value,
  onChange,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const [fromDraft, setFromDraft] = useState(value.fromDate ?? "");
  const [toDraft, setToDraft] = useState(value.toDate ?? "");

  // History is a record of past days, so future dates are not selectable
  // here. We pass the same `today` into both pickers (which disables
  // future days in the calendar UI) and gate the Apply button so a typed
  // value can never sneak through.
  const today = new Date();
  // Build a YYYY-MM-DD in the user's local time zone for plain string
  // comparison with the draft values.
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const isActive =
    value.range === "custom" &&
    Boolean(value.fromDate) &&
    Boolean(value.toDate);

  const isValidDraft =
    Boolean(fromDraft) &&
    Boolean(toDraft) &&
    fromDraft <= toDraft &&
    fromDraft <= todayIso &&
    toDraft <= todayIso;

  const labelText = isActive
    ? `${formatShortDate(value.fromDate!)} – ${formatShortDate(value.toDate!)}`
    : t("custom");

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setFromDraft(value.fromDate ?? "");
          setToDraft(value.toDate ?? "");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            isActive
              ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-foreground hover:bg-surface-muted",
          )}
        >
          <Calendar className="h-3 w-3 text-muted" />
          {labelText}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-3">
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t("from")}
            </label>
            <DatePicker
              value={fromDraft}
              onChange={setFromDraft}
              ariaLabel={t("from")}
              allowClear
              maxDate={today}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t("to")}
            </label>
            <DatePicker
              value={toDraft}
              onChange={setToDraft}
              ariaLabel={t("to")}
              allowClear
              maxDate={today}
            />
          </div>
          {fromDraft && toDraft && fromDraft > toDraft ? (
            <p className="text-xs text-danger">{t("rangeInvalid")}</p>
          ) : null}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
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
            >
              {t("clear")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isValidDraft}
              onClick={() => {
                if (!isValidDraft) return;
                onChange({
                  ...value,
                  range: "custom",
                  fromDate: fromDraft,
                  toDate: toDraft,
                });
                setOpen(false);
              }}
            >
              {t("apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatShortDate(iso: string): string {
  // Small-format the date inline in the chip without bringing in a heavy
  // formatter. Matches dayjs.format("MMM D") for ASCII-locale fallback.
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(`${iso}T00:00:00`));
  } catch {
    return iso;
  }
}
