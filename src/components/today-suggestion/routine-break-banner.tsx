"use client";

import { useForm } from "@tanstack/react-form";
import { CalendarClock, Hourglass, Loader2, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  getMinimumRoutineBreakResumeDate,
  routineBreakResumeSchema,
  toRoutineBreakDatePickerValue,
  toRoutineBreakEndsAt,
  type RoutineBreakResumeValues,
} from "@/components/today-suggestion/routine-break-validation";
import { firstFieldError } from "@/lib/form-errors";
import type {
  RoutineBreak,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

interface RoutineBreakBannerProps {
  routineBreak: RoutineBreak;
  isResuming: boolean;
  isUpdating: boolean;
  onResume: () => void;
  onUpdateEndsAt: (payload: UpdateRoutineBreakPayload) => void;
}

export function RoutineBreakBanner({
  routineBreak,
  isResuming,
  isUpdating,
  onResume,
  onUpdateEndsAt,
}: RoutineBreakBannerProps) {
  const t = useTranslations("todaysSuggestion.routineBreak");
  const defaultValues: RoutineBreakResumeValues = {
    endsAt: toRoutineBreakDatePickerValue(routineBreak.endsAt),
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: routineBreakResumeSchema,
      onSubmit: routineBreakResumeSchema,
    },
    onSubmit: ({ value }) => {
      onUpdateEndsAt({
        endsAt: toRoutineBreakEndsAt(value.endsAt),
      });
    },
  });

  const [minimumResumeDate] = useState(getMinimumRoutineBreakResumeDate);

  return (
    <section className="relative mb-4 overflow-hidden rounded-[24px] border border-[color:var(--border-strong)] bg-surface-muted shadow-soft">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,_var(--accent-glow)_0%,_transparent_70%)]"
      />
      <RoutineBreakLeaves />

      <div className="relative px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong shadow-soft"
          >
            <Hourglass className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-1">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[color:rgba(47,122,82,0.32)] bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-accent-strong">
              {t("statusLabel")}
            </span>
            <p className="mt-1.5 font-display text-xl font-bold leading-tight text-foreground sm:text-[22px]">
              {t("title")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {t("body")}
            </p>
            <p className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <CalendarClock className="h-3.5 w-3.5 text-accent-strong" />
              {routineBreak.endsAt
                ? t("resumeOn", {
                    date: formatResumeDate(routineBreak.endsAt),
                  })
                : t("resumeIndefinite")}
            </p>
          </div>
        </div>

        <form
          className="mt-5 flex flex-col gap-3 border-t border-[color:var(--border-strong)] pt-4 sm:flex-row sm:flex-wrap sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <form.Field name="endsAt">
            {(field) => (
              <div className="min-w-0 flex-1 sm:max-w-[260px]">
                <label
                  htmlFor={field.name}
                  className="text-xs font-semibold text-foreground"
                >
                  {t("resumeDateLabel")}
                </label>
                <div className="mt-1.5">
                  <DatePicker
                    value={field.state.value}
                    onChange={(next) => field.handleChange(next)}
                    ariaLabel={t("resumeDateLabel")}
                    minDate={minimumResumeDate}
                    allowClear
                  />
                </div>
                {field.state.meta.errors.length > 0 ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {firstFieldError(field.state.meta.errors, t)}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t("saveResumeDate")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!routineBreak.canResumeNow || isResuming}
              onClick={onResume}
            >
              {isResuming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {t("resumeNow")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

/**
 * Decorative botanical motif anchored top-right of the banner. A small
 * cluster of stylised leaves in sage tones — abstract, theme-safe (only
 * uses `--accent-strong` with opacity variations), and quiet enough to
 * never compete with the text content. Positioned `-z-0` behind the
 * relative content above.
 */
function RoutineBreakLeaves() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 120"
      fill="none"
      className="pointer-events-none absolute -right-2 -top-3 h-28 w-40 sm:-right-1 sm:-top-2 sm:h-32 sm:w-48"
    >
      {/* Large back leaf */}
      <g
        transform="translate(96 18) rotate(28)"
        opacity="0.18"
        fill="var(--accent-strong)"
      >
        <path d="M0 36 C 6 8 28 -4 52 0 C 50 26 32 44 6 44 Z" />
        <path
          d="M6 38 C 18 24 36 14 50 6"
          stroke="var(--accent-strong)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Mid leaf */}
      <g
        transform="translate(72 8) rotate(-12)"
        opacity="0.32"
        fill="var(--accent-strong)"
      >
        <path d="M0 28 C 4 8 22 -2 40 0 C 38 20 24 34 4 34 Z" />
        <path
          d="M4 30 C 14 18 28 10 40 4"
          stroke="var(--accent-strong)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Front sprig: small leaf + stem */}
      <g
        transform="translate(108 56) rotate(54)"
        opacity="0.55"
        fill="var(--accent-strong)"
      >
        <path d="M0 18 C 2 4 14 -2 26 0 C 24 14 14 22 2 22 Z" />
        <path
          d="M2 19 C 9 12 18 7 26 3"
          stroke="var(--accent-strong)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Tiny berries */}
      <circle cx="142" cy="40" r="2.2" fill="var(--accent-strong)" opacity="0.5" />
      <circle cx="148" cy="48" r="1.6" fill="var(--accent-strong)" opacity="0.35" />
    </svg>
  );
}

function formatResumeDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
