"use client";

import {
  Check,
  CircleCheck,
  Ellipsis,
  Sparkles,
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
import { RecordedSlotCard } from "@/components/today-suggestion/recorded-slot-card";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slot: TodaysSuggestionSlot;
  onRecord?: (slot: TodaysSuggestionSlot) => void;
  onEdit?: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
  onShowDetail?: (slot: TodaysSuggestionSlot) => void;
  personalizationOff?: boolean;
  timeZone?: string;
};

export function SuggestionSlotCard({
  slot,
  onRecord,
  onEdit,
  onShowDetail,
  personalizationOff = false,
  timeZone,
}: Props) {
  const t = useTranslations("todaysSuggestion.slot");

  if (!slot.isVisible) {
    return <LockedSlotCard slot={slot} timeZone={timeZone} />;
  }

  if (!slot.suggestion || slot.suggestion.generationStatus !== "ready") {
    return <SlotProcessingCard slot={slot} timeZone={timeZone} />;
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
  const rationale = buildSlotRationale(suggestion);
  const routineLabel = t(daypartRoutineLabelKey(suggestion.daypart));

  if (isRecorded) {
    return (
      <RecordedSlotCard
        slot={slot}
        applicationLogId={applicationLogId!}
        onEdit={onEdit}
        timeZone={timeZone}
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
      <header className="mb-3">
        <div className="flex items-start gap-3">
          <SuggestionDaypartIcon daypart={suggestion.daypart} />
          <p className="min-w-0 flex-1 font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
          </p>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
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
            {personalizationOff ? (
              <SuggestionStatusPill variant="basic">
                {t("basicSuggestion")}
              </SuggestionStatusPill>
            ) : null}
            <SuggestionModeBadge mode={suggestion.mode} />
          </div>
        </div>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>{routineLabel}</span>
          <span aria-hidden="true"> · </span>
          {t("stepCount", { count: suggestion.steps.length })}
        </p>
      </header>

      {personalizationOff ? <PersonalizationOffNotice /> : null}

      {rationale ? (
        <RationaleCard
          headline={rationale.headline}
          body={rationale.body}
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
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3.5 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-strong)] sm:h-11 sm:px-5 sm:text-sm"
        >
          <Check className="h-4 w-4" />
          {isAwaitingRecord ? t("recordWhatIApplied") : t("markAsApplied")}
        </button>
        {onShowDetail ? (
          <button
            type="button"
            onClick={() => onShowDetail(slot)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--border-strong)] bg-surface text-foreground transition hover:bg-accent-soft hover:text-accent-strong sm:h-11 sm:w-11"
            aria-label={t("whyThisRoutine")}
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function PersonalizationOffNotice() {
  const t = useTranslations("todaysSuggestion.slot");
  return (
    <div className="mb-3 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] px-3 py-2 text-xs leading-relaxed text-muted">
      <span className="font-semibold text-foreground">
        {t("personalizationOffTitle")}
      </span>{" "}
      {t("personalizationOffBody")}
    </div>
  );
}

function RationaleCard({
  headline,
  body,
  onShowDetail,
  tone,
}: {
  headline: string;
  body: string | null;
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
        <strong>{headline}</strong>
        {body ? <> {body}</> : null}
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

function buildSlotRationale(
  suggestion: TodaysSuggestionSlot["suggestion"],
): { headline: string; body: string | null } | null {
  if (!suggestion) return null;
  const headline =
    cleanRationaleText(suggestion.rationaleHeadline) ??
    cleanRationaleText(suggestion.explanation?.headline);
  const firstBody = cleanRationaleText(suggestion.explanation?.body[0]);

  if (!headline && !firstBody) return null;
  if (!headline) {
    return { headline: firstBody!, body: null };
  }
  return {
    headline,
    body: firstBody && firstBody !== headline ? firstBody : null,
  };
}

function cleanRationaleText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function daypartRoutineLabelKey(
  daypart: TodaysSuggestionSlot["daypart"],
): "morningLabel" | "noonLabel" | "eveningLabel" {
  if (daypart === "noon") return "noonLabel";
  if (daypart === "evening") return "eveningLabel";
  return "morningLabel";
}
