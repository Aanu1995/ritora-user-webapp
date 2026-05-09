"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildBackendUrl } from "@/lib/media-url";
import { SmoothImage } from "@/components/ui/smooth-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CalendarDay,
  CalendarPayload,
} from "@/types/skin-journal";

interface JournalCalendarProps {
  payload: CalendarPayload | undefined;
  isLoading?: boolean;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  todayLocalDate: string;
  onChangeMonth: (delta: -1 | 1) => void;
  monthLabel: string;
  selectableDates?: ReadonlySet<string>;
  disableUnavailableDates?: boolean;
  monthOptions?: Array<{ month: string; photo_count: number }>;
  onSelectMonth?: (month: string) => void;
}

const STATE_BORDER: Record<CalendarDay["state"], string> = {
  no_entry: "border border-dashed border-border bg-background hover:bg-accent-soft",
  entry_no_photo: "border border-[color:var(--border-strong)] bg-accent-soft/30 hover:bg-surface",
  pending: "border border-[color:var(--warning-border)] bg-surface",
  completed:
    "border border-[color:var(--accent-soft)] bg-surface hover:border-accent",
  reaction:
    "border-[1.5px] border-danger bg-[color:var(--danger-soft)] hover:bg-[color:var(--danger-soft)]",
  failed: "border border-[color:var(--warning-border)] bg-warning-soft",
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function buildMonthDays(year: number, month: number): {
  date: string;
  inMonth: boolean;
  weekIndex: number;
  dayIndex: number;
}[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const leadingPad = (firstOfMonth.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = Math.ceil((leadingPad + daysInMonth) / 7) * 7;
  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - leadingPad);

  const cells: {
    date: string;
    inMonth: boolean;
    weekIndex: number;
    dayIndex: number;
  }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    cells.push({
      date,
      inMonth: d.getUTCMonth() === month - 1,
      weekIndex: Math.floor(i / 7),
      dayIndex: i % 7,
    });
  }
  return cells;
}

export function JournalCalendar({
  payload,
  isLoading,
  selectedDate,
  onSelectDate,
  todayLocalDate,
  onChangeMonth,
  monthLabel,
  selectableDates,
  disableUnavailableDates = false,
  monthOptions = [],
  onSelectMonth,
}: JournalCalendarProps) {
  const t = useTranslations("journal.calendar");

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const d of payload?.days ?? []) map.set(d.date, d);
    return map;
  }, [payload]);

  const [year, monthNum] = (payload?.month ?? "1970-01").split("-").map((s) =>
    parseInt(s, 10),
  );
  const cells = buildMonthDays(year, monthNum);
  const showSkeletonGrid = isLoading && !payload;
  const visibleMonth = payload?.month ?? "";
  const todayMonth = todayLocalDate.slice(0, 7);
  const canNavigateNext = visibleMonth < todayMonth;

  return (
    <div className="rounded-[14px] border border-border bg-surface p-4 lg:flex lg:h-full lg:flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{monthLabel}</p>
          {monthOptions.length > 0 && onSelectMonth ? (
            <Select
              value={payload?.month ?? ""}
              onValueChange={onSelectMonth}
            >
              <SelectTrigger
                aria-label={t("selectTrackedMonth")}
                className="mt-1 h-7 max-w-full gap-1.5 rounded-lg border-border bg-surface px-2 py-0 text-xs text-muted [&>svg]:h-3.5 [&>svg]:w-3.5"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.month} value={option.month}>
                    {t("trackedMonthLabel", {
                      month: option.month,
                      count: option.photo_count,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={t("previous")}
            onClick={() => onChangeMonth(-1)}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-border-strong bg-surface text-xs hover:bg-accent-soft"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("next")}
            disabled={!canNavigateNext}
            onClick={() => {
              if (canNavigateNext) {
                onChangeMonth(1);
              }
            }}
            className={cn(
              "grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-border-strong bg-surface text-xs hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase tracking-[0.06em] text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {showSkeletonGrid ? (
        <>
          <div
            className="grid grid-cols-7 gap-1"
            aria-label={t("loading")}
          >
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[10px] bg-surface-muted"
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-16 animate-pulse rounded-full bg-surface-muted"
              />
            ))}
          </div>
        </>
      ) : (
      <>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const day = cell.inMonth ? dayMap.get(cell.date) : null;
          const state: CalendarDay["state"] = day?.state ?? "no_entry";
          const isOutside = !cell.inMonth;
          const isUnavailable =
            disableUnavailableDates &&
            (!selectableDates || !selectableDates.has(cell.date));
          const isFuture = cell.date > todayLocalDate;
          const isDisabled = isOutside || isUnavailable || isFuture;
          const isToday = cell.date === todayLocalDate;
          const isSelected = cell.date === selectedDate;
          const dateNum = parseInt(cell.date.slice(8), 10);

          const baseClass =
            "relative flex aspect-square cursor-pointer flex-col justify-between rounded-[10px] p-1 text-[11px] transition";
          const outsideClass = isOutside
            ? "cursor-default text-foreground/30 bg-background border-transparent"
            : STATE_BORDER[state];

          return (
            <button
              type="button"
              key={cell.date}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectDate(cell.date)}
              className={cn(
                baseClass,
                outsideClass,
                (isUnavailable || isFuture) &&
                  "cursor-not-allowed opacity-40 hover:bg-background",
                isToday && !isSelected && "ring-2 ring-accent-strong",
                isSelected &&
                  "ring-2 ring-accent-strong border-accent bg-accent-soft",
              )}
              aria-label={cell.date}
              aria-pressed={isSelected}
            >
              <span className="text-left font-semibold leading-none">
                {dateNum}
              </span>

              {day?.has_insight ? (
                <span
                  aria-hidden
                  className="absolute right-1 top-0.5 text-[9px] leading-none"
                >
                  ✨
                </span>
              ) : null}

              {day?.thumbnail_url ? (
                <span
                  className={cn(
                    "relative mt-1 block w-full flex-1 min-h-[18px] max-h-[26px] overflow-hidden rounded-md",
                    state === "pending" && "animate-pulse",
                  )}
                >
                  <SmoothImage
                    src={buildBackendUrl(day.thumbnail_url) ?? day.thumbnail_url}
                    alt=""
                    sizes="48px"
                    className="h-full w-full"
                  />
                </span>
              ) : day?.has_photo === false && day?.entry_id ? (
                <span className="mt-0.5 block h-1 w-1 rounded-full bg-muted" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted">
        <LegendDot label={t("legend.completed")} color="bg-accent" />
        <LegendDot label={t("legend.noEntry")} color="bg-foreground/20" />
        <LegendDot
          label={t("legend.pending")}
          color="bg-[color:var(--warning)]"
          pulse
        />
        <LegendDot label={t("legend.reaction")} color="bg-danger" />
        <LegendDot
          label={t("legend.insight")}
          color="bg-[color:var(--ai-strong)]"
        />
      </div>
      </>
      )}

    </div>
  );
}

function LegendDot({
  label,
  color,
  pulse,
}: {
  label: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          color,
          pulse && "animate-pulse",
        )}
      />
      {label}
    </span>
  );
}
