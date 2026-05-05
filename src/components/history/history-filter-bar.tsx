"use client";

import {
  Calendar,
  Check,
  ChevronDown,
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
      <RangeDropdown value={value} onChange={update} />

      <Divider />

      <DaypartDropdown value={value} onChange={update} />

      <Divider />

      <ModeDropdown value={value} onChange={update} />

      <Divider />

      <StatusDropdown value={value} onChange={update} />

      <button
        type="button"
        aria-pressed={value.hasBeenEdited === true}
        onClick={() =>
          update({
            ...value,
            hasBeenEdited:
              value.hasBeenEdited === true ? undefined : true,
          })
        }
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
          value.hasBeenEdited === true
            ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
            : "border-border bg-surface text-foreground hover:bg-surface-muted",
        )}
      >
        <Pencil
          className={cn(
            "h-3 w-3",
            value.hasBeenEdited === true
              ? "text-accent-strong"
              : "text-muted",
          )}
        />
        {t("edited")}
      </button>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-border" />;
}

/**
 * Range dropdown. One pill trigger that opens a popover containing the three
 * range options as a single list: Last 7 days, Last 30 days, Custom range.
 * Choosing a preset applies immediately and closes. Choosing Custom expands
 * the From/To date editor inline; the new range only applies when the user
 * clicks Apply.
 *
 * Validation: `to` must be on or after `from`, and both must be on or
 * before today. Clear resets back to the 7d default.
 */
/**
 * Daypart dropdown. Single pill trigger with placeholder "Daypart" when no
 * selection is active. Picking an option applies and closes; "All dayparts"
 * clears the filter.
 */
function DaypartDropdown({
  value,
  onChange,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const active = value.daypart ?? null;

  const triggerLabel = active ? t(active) : t("daypart");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("daypart")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            active
              ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-foreground hover:bg-surface-muted",
          )}
        >
          {(() => {
            const Icon =
              DAYPART_FILTERS.find((d) => d.value === active)?.Icon ?? Clock3;
            return (
              <Icon
                className={cn(
                  "h-3 w-3",
                  active ? "text-accent-strong" : "text-muted",
                )}
              />
            );
          })()}
          {triggerLabel}
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
                onChange({ ...value, daypart: undefined });
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface-muted"
            >
              <span className="font-medium text-muted">{t("daypart_all")}</span>
            </button>
          ) : null}
          {DAYPART_FILTERS.map(({ value: daypart, labelKey, Icon }) => {
            const isActive = active === daypart;
            return (
              <button
                key={daypart}
                type="button"
                onClick={() => {
                  onChange({ ...value, daypart });
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-surface-muted",
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

/**
 * Status dropdown. Folds the five status options plus the "Edited" boolean
 * into one menu since they are all "what happened with this slot" filters.
 * Picking Edited toggles `hasBeenEdited=true` and clears `status`; picking
 * any real status clears `hasBeenEdited`. Neutral placeholder until selected.
 */
function StatusDropdown({
  value,
  onChange,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const activeKey = value.status ?? null;

  const triggerLabel = activeKey ? t(activeKey) : t("status");
  const TriggerIcon =
    STATUS_FILTERS.find((s) => s.value === activeKey)?.Icon ?? Check;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("status")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            activeKey
              ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-foreground hover:bg-surface-muted",
          )}
        >
          <TriggerIcon
            className={cn(
              "h-3 w-3",
              activeKey ? "text-accent-strong" : "text-muted",
            )}
          />
          {triggerLabel}
          <ChevronDown
            className={cn(
              "h-3 w-3",
              activeKey ? "text-accent-strong" : "text-muted",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[220px] p-1">
        <div className="flex flex-col">
          {activeKey ? (
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, status: undefined });
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface-muted"
            >
              <span className="font-medium text-muted">{t("status_all")}</span>
            </button>
          ) : null}
          {STATUS_FILTERS.map(({ value: status, labelKey, Icon }) => {
            const isActive = activeKey === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  onChange({ ...value, status });
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-surface-muted",
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

/**
 * Routine-type dropdown. Same pattern as DaypartDropdown: neutral placeholder
 * pill until a value is picked, "Show all" appears in the menu only once
 * something is actively selected so the user can clear back to no selection.
 */
function ModeDropdown({
  value,
  onChange,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const active = value.mode ?? null;

  const triggerLabel = active ? t(active) : t("mode");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("mode")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
            active
              ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-foreground hover:bg-surface-muted",
          )}
        >
          {(() => {
            const Icon =
              MODE_FILTERS.find((m) => m.value === active)?.Icon ?? Sparkles;
            return (
              <Icon
                className={cn(
                  "h-3 w-3",
                  active ? "text-accent-strong" : "text-muted",
                )}
              />
            );
          })()}
          {triggerLabel}
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
                onChange({ ...value, mode: undefined });
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface-muted"
            >
              <span className="font-medium text-muted">{t("mode_all")}</span>
            </button>
          ) : null}
          {MODE_FILTERS.map(({ value: mode, labelKey, Icon }) => {
            const isActive = active === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onChange({ ...value, mode });
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-surface-muted",
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

function RangeDropdown({
  value,
  onChange,
}: {
  value: SuggestionHistoryListQuery;
  onChange: (next: SuggestionHistoryListQuery) => void;
}) {
  const t = useTranslations("history.filters");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"presets" | "custom">("presets");
  const [fromDraft, setFromDraft] = useState(value.fromDate ?? "");
  const [toDraft, setToDraft] = useState(value.toDate ?? "");

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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

  const triggerLabel = isCustomActive
    ? `${formatShortDate(value.fromDate!)} – ${formatShortDate(value.toDate!)}`
    : activeRange === "30d"
      ? t("last30d")
      : t("last7d");

  const PRESETS: ReadonlyArray<{
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
          {PRESETS.map((preset) => {
            const isActive =
              preset.key === "custom"
                ? isCustomActive
                : activeRange === preset.key && !isCustomActive;
            return (
              <button
                key={preset.key}
                type="button"
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
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-surface-muted",
                )}
              >
                <span className="font-medium">{preset.label}</span>
                {isActive ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}

          {view === "custom" ? (
            <div className="mt-2 space-y-2 border-t border-border px-2 pt-3 pb-2">
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
          ) : null}
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
