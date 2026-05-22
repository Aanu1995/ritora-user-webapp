"use client";

import { MessageSquareText, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SuggestionProvenanceChip } from "@/components/today-suggestion/mode-badge";
import { SuggestionProductImageTile } from "@/components/today-suggestion/product-image-tile";
import type { SuggestionStep } from "@/types/suggestions";

type Props = {
  step: SuggestionStep;
  index: number;
  compactApplied?: boolean;
};

export function SuggestionStepRow({
  step,
  index,
  compactApplied = false,
}: Props) {
  const t = useTranslations("todaysSuggestion.step");
  const provenance = step.provenance;
  const productBrand = step.productBrand ?? step.product?.brand ?? null;
  const productLabel =
    step.productName ??
    step.product?.name ??
    step.customLabel ??
    stepLabelLabel(step.stepLabel);
  const productImage = step.product?.imageUrl ?? null;
  const productCategory = step.product?.category ?? step.stepLabel;

  const details = !compactApplied ? (
    <>
      <StepMeta step={step} />
      {step.routineNote ? (
        <div className="mt-2 flex gap-1.5 rounded-xl border border-border/70 bg-surface/70 px-2.5 py-2 text-[11.5px] leading-relaxed text-muted">
          <MessageSquareText
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]"
            aria-hidden
          />
          <p>
            <span className="font-semibold text-foreground">
              {t("routineNote")}
            </span>{" "}
            {step.routineNote}
          </p>
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1">
        <SuggestionProvenanceChip provenance={provenance} />
        {step.explanation ? (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] text-muted">
            {step.explanation}
          </span>
        ) : null}
        {step.safetyWarnings.length > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:rgba(184,84,10,0.3)] bg-warning-soft px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--note-warm-fg)]">
            <TriangleAlert className="h-2.5 w-2.5" />
            {step.safetyWarnings[0]?.message}
          </span>
        ) : null}
      </div>
    </>
  ) : null;

  return (
    <div
      data-step-provenance={provenance}
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-2xl border p-2.5",
        compactApplied
          ? "border-transparent bg-[color:color-mix(in_srgb,var(--surface-muted)_70%,var(--accent-soft))]"
          : [
              provenance === "specialist_locked" &&
                "border-[color:rgba(47,122,82,0.32)] bg-[color:var(--accent-soft)]/60",
              provenance === "ai_added" &&
                "border-[color:var(--ai-border)] bg-[color:var(--ai-soft)]",
              provenance === "user_routine" &&
                "border-transparent bg-surface-muted",
            ],
      )}
    >
      <StepLeading
        step={step}
        index={index}
        compactApplied={compactApplied}
      />

      <SuggestionProductImageTile
        imageUrl={productImage}
        label={productLabel}
        category={productCategory}
      />

      <div className="min-w-0 flex-1">
        {productBrand ? (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {productBrand}
          </div>
        ) : null}

        <div className="text-sm font-semibold leading-tight text-foreground">
          {productLabel}
        </div>

        {details ? <div className="hidden sm:block">{details}</div> : null}
      </div>

      {details ? (
        <div className="mt-1 basis-full sm:hidden">{details}</div>
      ) : null}
    </div>
  );
}

function StepLeading({
  step,
  index,
  compactApplied,
}: {
  step: SuggestionStep;
  index: number;
  compactApplied: boolean;
}) {
  if (compactApplied) {
    return (
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
          "bg-[color:var(--accent)] text-[10px] font-bold text-white",
        )}
        aria-hidden
      >
        ✓
      </span>
    );
  }

  const displayNumber = index + 1;

  if (step.provenance === "specialist_locked") {
    return (
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--accent)] text-xs font-semibold text-white"
        aria-hidden
      >
        {displayNumber}
      </span>
    );
  }

  if (step.provenance === "ai_added") {
    return (
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--ai-strong)] text-xs font-semibold text-white"
        aria-hidden
      >
        {displayNumber}
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground"
      aria-hidden
    >
      {displayNumber}
    </span>
  );
}

function StepMeta({ step }: { step: SuggestionStep }) {
  const parts: string[] = [];
  if (step.applicationMethod) parts.push(step.applicationMethod);
  if (step.quantity) parts.push(step.quantity);
  if (step.waitAfterMinutes && step.waitAfterMinutes > 0) {
    parts.push(`Wait ${step.waitAfterMinutes} min`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] text-muted">
      {parts.map((part, index) => (
        <span key={`${index}-${part}`} className="flex items-center gap-1.5">
          {part}
          {index < parts.length - 1 ? (
            <span
              aria-hidden
              className="inline-block h-[3px] w-[3px] rounded-full bg-current opacity-60"
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

function stepLabelLabel(stepLabel: string): string {
  return stepLabel.replace(/-/g, " ");
}
