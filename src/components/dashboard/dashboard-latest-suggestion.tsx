"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppRoute } from "@/constants/app-routes";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatSlotTime12h } from "@/lib/suggestion-daypart";
import type {
  SuggestionStep,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

type Props = {
  slot: TodaysSuggestionSlot;
};

const PREVIEW_STEP_COUNT = 3;

/**
 * Compact "latest actionable suggestion" card surfaced on the dashboard.
 */
export function DashboardLatestSuggestion({ slot }: Props) {
  const t = useTranslations("dashboard.latestSuggestion");
  const tSlot = useTranslations("todaysSuggestion.slot");

  const suggestion = slot.suggestion;
  if (!suggestion) return null;

  const isAwaitingRecord = slot.status === "recordable";
  const steps = [...suggestion.steps].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );
  const previewSteps = steps.slice(0, PREVIEW_STEP_COUNT);
  const remainingCount = Math.max(steps.length - previewSteps.length, 0);
  const headline =
    suggestion.rationaleHeadline?.trim() ||
    suggestion.explanation?.headline?.trim() ||
    null;
  const routineLabel = tSlot(daypartRoutineLabelKey(suggestion.daypart));

  return (
    <section
      aria-label={t("ariaLabel", { routine: routineLabel })}
      className={cn(
        "rounded-2xl border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-5",
        "border-[color:rgba(47,122,82,0.32)]",
        isAwaitingRecord && "border-[color:var(--note-cool-border)]",
      )}
    >
      <header className="flex items-start gap-3">
        <SuggestionDaypartIcon daypart={suggestion.daypart} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent-strong">
            {t("eyebrow", { routine: routineLabel })}
          </p>
          <p className="mt-0.5 font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
            <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {tSlot("stepCount", { count: suggestion.steps.length })}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {isAwaitingRecord ? (
            <SuggestionStatusPill variant="awaiting">
              {tSlot("awaitingRecord")}
            </SuggestionStatusPill>
          ) : (
            <SuggestionStatusPill
              variant="ready"
              icon={<Sparkles className="h-3 w-3" />}
            >
              {tSlot("ready")}
            </SuggestionStatusPill>
          )}
          <SuggestionModeBadge mode={suggestion.mode} />
        </div>
      </header>

      {headline ? (
        <p className="mt-3 text-sm leading-snug text-foreground">
          <strong>{headline}</strong>
        </p>
      ) : null}

      {previewSteps.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-surface-muted/60 p-2">
          {previewSteps.map((step, index) => (
            <li key={step.id}>
              <CompactStepRow step={step} index={index} />
            </li>
          ))}
          {remainingCount > 0 ? (
            <li className="px-1.5 py-0.5 text-[11.5px] font-medium text-muted">
              {t("moreSteps", { count: remainingCount })}
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button asChild size="sm">
          <Link href={AppRoute.TodaysSuggestion}>
            <ArrowUpRight className="h-4 w-4" aria-hidden />
            {t("openRoutine")}
          </Link>
        </Button>
      </div>
    </section>
  );
}

function CompactStepRow({
  step,
  index,
}: {
  step: SuggestionStep;
  index: number;
}) {
  const brand = step.productBrand ?? step.product?.brand ?? null;
  const label =
    step.productName ??
    step.product?.name ??
    step.customLabel ??
    step.stepLabel.replace(/-/g, " ");

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-surface px-2 py-1.5">
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[color:var(--accent)] text-[11px] font-bold text-white"
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        {brand ? (
          <div className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
            {brand}
          </div>
        ) : null}
        <div className="truncate text-[12.5px] font-semibold leading-tight text-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

function daypartRoutineLabelKey(
  daypart: TodaysSuggestionSlot["daypart"],
): "morningLabel" | "noonLabel" | "eveningLabel" {
  if (daypart === "noon") return "noonLabel";
  if (daypart === "evening") return "eveningLabel";
  return "morningLabel";
}
