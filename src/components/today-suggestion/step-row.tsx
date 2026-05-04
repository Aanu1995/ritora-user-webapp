"use client";

import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuggestionProvenanceChip } from "@/components/today-suggestion/mode-badge";
import type { SuggestionStep } from "@/types/suggestions";

type Props = {
  step: SuggestionStep;
  /**
   * When true, the step is shown in its compact "applied" form, used in
   * recorded slot cards on Today and in the suggested-vs-applied history
   * compare. Hides the rationale and meta and shows a checkmark instead of
   * the order number.
   */
  compactApplied?: boolean;
};

/**
 * One row in a slot card's step list. Visual breakdown matches the mockup:
 *  - Numbered badge (or check when compactApplied)
 *  - Product image (or category illustration)
 *  - Brand uppercase + product name
 *  - Meta line: application method · quantity · wait
 *  - Reason chip(s): provenance + AI reason or specialist note
 *  - Optional safety warning chip
 */
export function SuggestionStepRow({ step, compactApplied = false }: Props) {
  const provenance = step.provenance;
  const productImage = step.product?.imageUrl ?? null;

  return (
    <div
      data-step-provenance={provenance}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-2.5",
        provenance === "specialist_locked" &&
          "border-[color:rgba(47,122,82,0.32)] bg-[color:var(--accent-soft)]/60",
        provenance === "ai_added" &&
          "border-[color:var(--ai-border)] bg-[color:var(--ai-soft)]",
        provenance === "user_routine" && "border-transparent bg-surface-muted",
      )}
    >
      <StepLeading step={step} compactApplied={compactApplied} />

      <div className="grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-base">
        {productImage ? (
          <Image
            src={productImage}
            alt=""
            width={40}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{categoryEmoji(step.stepLabel)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {step.product ? (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {step.product.brand}
          </div>
        ) : step.productBrand ? (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {step.productBrand}
          </div>
        ) : null}

        <div className="text-sm font-semibold leading-tight text-foreground">
          {step.product?.name ??
            step.productName ??
            step.customLabel ??
            stepLabelLabel(step.stepLabel)}
        </div>

        {!compactApplied ? <StepMeta step={step} /> : null}

        {!compactApplied ? (
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
        ) : null}
      </div>
    </div>
  );
}

function StepLeading({
  step,
  compactApplied,
}: {
  step: SuggestionStep;
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

  if (step.provenance === "specialist_locked") {
    return (
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--accent)] text-xs font-semibold text-white"
        aria-hidden
      >
        {step.stepOrder + 1}
      </span>
    );
  }

  if (step.provenance === "ai_added") {
    return (
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--ai-strong)] text-xs font-semibold text-white"
        aria-hidden
      >
        {step.stepOrder + 1}
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground"
      aria-hidden
    >
      {step.stepOrder + 1}
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

function categoryEmoji(stepLabel: string): string {
  switch (stepLabel) {
    case "cleanser":
      return "🧴";
    case "toner":
    case "essence":
      return "💧";
    case "serum":
    case "treatment":
      return "🧪";
    case "moisturizer":
      return "🧴";
    case "sun-protection":
      return "☀️";
    case "exfoliant":
      return "💎";
    case "mask":
      return "🪷";
    case "eye-care":
      return "👁";
    case "lip-care":
      return "💋";
    default:
      return "✦";
  }
}
