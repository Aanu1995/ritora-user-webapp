"use client";

import {
  Check,
  CircleCheck,
  Ellipsis,
  Pencil,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatSlotTime12h } from "@/lib/suggestion-daypart";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import {
  LockedSlotCard,
  SlotProcessingCard,
} from "@/components/today-suggestion/slot-state-card";
import { SuggestionStepRow } from "@/components/today-suggestion/step-row";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slot: TodaysSuggestionSlot;
  /** Open the recording sheet. Provided by the page so a single sheet instance is shared. */
  onRecord?: (slot: TodaysSuggestionSlot) => void;
  /** Open the edit sheet for an already-recorded application. */
  onEdit?: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
  /** Open the suggestion detail drawer ("Why this routine"). */
  onShowDetail?: (slot: TodaysSuggestionSlot) => void;
};

/**
 * The Today's Suggestion slot card. Renders one of four visual states based
 * on the slot's lifecycle:
 *
 *  1. Locked — the visibility window has not opened yet. Muted card, lock
 *     icon, countdown.
 *  2. Ready — generated and visible, not yet recorded. Full content with
 *     primary "Mark as applied" CTA.
 *  3. Recorded — user has logged what they applied. Compact card with the
 *     applied list and an Edit link.
 *  4. Awaiting record — slot time has passed, no record yet. Highlighted
 *     in cool tones to nudge the user to record.
 *
 * Specialist-only slots (every step locked by specialist, no AI additions)
 * surface a Specialist pill alongside the mode badge.
 */
export function SuggestionSlotCard({
  slot,
  onRecord,
  onEdit,
  onShowDetail,
}: Props) {
  const t = useTranslations("todaysSuggestion.slot");

  if (!slot.isVisible) {
    return <LockedSlotCard slot={slot} />;
  }

  if (!slot.suggestion || slot.suggestion.generationStatus !== "ready") {
    return <SlotProcessingCard slot={slot} />;
  }

  const suggestion = slot.suggestion;
  const applicationLogId =
    slot.recording?.applicationLogId ?? suggestion.applicationLogId;
  const isRecorded = Boolean(applicationLogId);
  const isAwaitingRecord =
    !isRecorded && (slot.status === "recordable" || slot.status === "missed");

  const isSpecialistOnly =
    suggestion.steps.length > 0 &&
    suggestion.steps.every((step) => step.provenance === "specialist_locked");

  const stepsByOrder = [...suggestion.steps].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );

  if (isRecorded) {
    return (
      <RecordedSlotCard
        slot={slot}
        applicationLogId={applicationLogId!}
        onEdit={onEdit}
      />
    );
  }

  return (
    <article
      className={cn(
        "rounded-3xl border bg-surface p-4 shadow-[var(--shadow-soft)]",
        "border-[color:rgba(47,122,82,0.32)]",
        suggestion.simplifiedForReaction &&
          "border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)]/40",
        isAwaitingRecord && "border-[color:var(--note-cool-border)]",
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <SuggestionDaypartIcon daypart={suggestion.daypart} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("stepCount", { count: suggestion.steps.length })}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {isAwaitingRecord ? (
            <SuggestionStatusPill variant="awaiting">
              {t("awaitingRecord")}
            </SuggestionStatusPill>
          ) : (
            <SuggestionStatusPill
              variant="ready"
              icon={<CircleCheck className="h-3 w-3" />}
            >
              {t("ready")}
            </SuggestionStatusPill>
          )}
          {suggestion.simplifiedForReaction ? (
            <SuggestionStatusPill variant="simplified">
              {t("simplified")}
            </SuggestionStatusPill>
          ) : null}
          {isSpecialistOnly ? (
            <SuggestionStatusPill variant="specialist">
              {t("specialist")}
            </SuggestionStatusPill>
          ) : null}
          <SuggestionModeBadge mode={suggestion.mode} />
        </div>
      </header>

      {suggestion.rationaleHeadline ? (
        <RationaleCard
          headline={suggestion.rationaleHeadline}
          onShowDetail={onShowDetail ? () => onShowDetail(slot) : undefined}
          tone={isSpecialistOnly ? "specialist" : "ai"}
        />
      ) : null}

      <ol className="mt-3 flex flex-col gap-2.5">
        {stepsByOrder.map((step) => (
          <li key={step.id}>
            <SuggestionStepRow step={step} />
          </li>
        ))}
      </ol>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onRecord?.(slot)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          <Check className="h-4 w-4" />
          {isAwaitingRecord ? t("recordWhatIApplied") : t("markAsApplied")}
        </button>
        <button
          type="button"
          onClick={() => onShowDetail?.(slot)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition hover:bg-surface-muted"
          aria-label={t("customise")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition hover:bg-surface-muted"
          aria-label={t("more")}
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function RationaleCard({
  headline,
  onShowDetail,
  tone,
}: {
  headline: string;
  onShowDetail?: () => void;
  tone: "ai" | "specialist";
}) {
  const t = useTranslations("todaysSuggestion.slot");
  const Icon = tone === "specialist" ? CircleCheck : Sparkles;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm leading-snug",
        tone === "ai"
          ? "border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] text-foreground"
          : "border-[color:rgba(47,122,82,0.32)] bg-accent-soft text-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          tone === "ai"
            ? "text-[color:var(--ai-strong)]"
            : "text-[color:var(--accent-strong)]",
        )}
      />
      <p className="min-w-0 flex-1">
        {headline}
        {onShowDetail ? (
          <>
            {" "}
            <button
              type="button"
              onClick={onShowDetail}
              className={cn(
                "font-semibold",
                tone === "ai"
                  ? "text-[color:var(--accent-strong)]"
                  : "text-accent-strong",
              )}
            >
              {t("whyThisRoutine")} →
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}

function RecordedSlotCard({
  slot,
  applicationLogId,
  onEdit,
}: {
  slot: TodaysSuggestionSlot;
  applicationLogId: string;
  onEdit?: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
}) {
  const t = useTranslations("todaysSuggestion.slot");
  const suggestion = slot.suggestion!;

  const stepsByOrder = [...suggestion.steps].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );

  return (
    <article
      className={cn(
        "rounded-3xl border p-4 shadow-[var(--shadow-soft)]",
        "border-[color:rgba(47,122,82,0.22)] bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--accent-soft))]",
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <SuggestionDaypartIcon daypart={suggestion.daypart} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("appliedSummary", {
              count: stepsByOrder.length,
              total: stepsByOrder.length,
            })}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <SuggestionStatusPill
            variant="applied"
            icon={<Check className="h-3 w-3" />}
          >
            {t("applied")}
          </SuggestionStatusPill>
          <SuggestionModeBadge mode={suggestion.mode} />
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {stepsByOrder.map((step) => (
          <li key={step.id}>
            <SuggestionStepRow step={step} compactApplied />
          </li>
        ))}
      </ul>

      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-xs text-muted">
          {t("recordedMatchesSuggestion")}
        </span>
        <button
          type="button"
          onClick={() => onEdit?.(slot, applicationLogId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("edit")}
        </button>
      </div>
    </article>
  );
}
