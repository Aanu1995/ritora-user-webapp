import type { SuggestionInstance } from "@/types/suggestions";

export type IntentCopy = {
  headline: string;
  body: string[];
};

export type StepReasonRow = {
  stepOrder: number;
  name: string | null;
  imageUrl: string | null;
  category: string | null;
  reason: string;
};

export function buildIntent(suggestion: SuggestionInstance): IntentCopy | null {
  const headline = cleanText(
    suggestion.explanation?.headline ?? suggestion.rationaleHeadline,
  );
  const body = (suggestion.explanation?.body ?? [])
    .map(cleanText)
    .filter((value): value is string => value !== null && value !== headline);

  if (!headline && body.length === 0) return null;
  return {
    headline: headline ?? body[0]!,
    body: headline ? body : body.slice(1),
  };
}

export function buildStepReasonRows(
  suggestion: SuggestionInstance,
): StepReasonRow[] {
  const reasonByStep = new Map(
    (suggestion.explanation?.perStepReasons ?? []).map((row) => [
      row.stepOrder,
      row.reason,
    ]),
  );

  const rows = [...suggestion.steps]
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((step): StepReasonRow | null => {
      const reason =
        cleanText(reasonByStep.get(step.stepOrder)) ??
        cleanText(step.explanation);
      if (!reason) return null;
      return {
        stepOrder: step.stepOrder,
        name: stepProductName(step),
        imageUrl: step.product?.imageUrl ?? null,
        category: step.product?.category ?? step.stepLabel,
        reason,
      };
    })
    .filter((row): row is StepReasonRow => row !== null);

  const knownStepOrders = new Set(rows.map((row) => row.stepOrder));
  const detachedReasons = [...reasonByStep.entries()]
    .filter(([stepOrder]) => !knownStepOrders.has(stepOrder))
    .map(([stepOrder, reason]) => ({
      stepOrder,
      name: null,
      imageUrl: null,
      category: null,
      reason,
    }));

  return [...rows, ...detachedReasons].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );
}

function stepProductName(step: SuggestionInstance["steps"][number]): string {
  const brand = step.productBrand ?? step.product?.brand;
  const name = step.productName ?? step.product?.name ?? step.customLabel;
  return [brand, name].filter(Boolean).join(" ").trim() || step.stepLabel;
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
