import {
  StepLabel,
  type RoutineStep,
  type RoutineStepInput,
  type RoutineStepProductSummary,
} from '@/types/schedule';

export function stepsFromEntity(entitySteps: RoutineStep[]): RoutineStepInput[] {
  return entitySteps
    .slice()
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((step, index) => ({
      id: step.id,
      stepOrder: index,
      inventoryProductId: step.inventoryProductId,
      stepLabel: step.stepLabel,
      customLabel: step.customLabel,
      notes: step.notes,
      optional: step.optional,
    }));
}

export function buildProductLookup(
  entitySteps: RoutineStep[],
): Map<string, RoutineStepProductSummary> {
  const map = new Map<string, RoutineStepProductSummary>();

  for (const step of entitySteps) {
    if (step.product) {
      map.set(step.product.id, step.product);
    }
  }

  return map;
}

export function getRoutineStepRowId(
  step: RoutineStepInput,
  index: number,
): string {
  return step.id ?? `new-${index}`;
}

export function findRoutineStepIndexByRowId(
  steps: RoutineStepInput[],
  rowId: string,
): number {
  return steps.findIndex(
    (step, index) => getRoutineStepRowId(step, index) === rowId,
  );
}

export function replaceRoutineStepAtIndex(
  steps: RoutineStepInput[],
  index: number,
  nextStep: RoutineStepInput,
): RoutineStepInput[] {
  const nextSteps = steps.slice();
  nextSteps[index] = nextStep;
  return nextSteps;
}

export function removeRoutineStepAtIndex(
  steps: RoutineStepInput[],
  index: number,
): RoutineStepInput[] {
  const nextSteps = steps.slice();
  nextSteps.splice(index, 1);

  return nextSteps.map((step, stepOrder) => ({
    ...step,
    stepOrder,
  }));
}

export function createRoutineStepInput(
  idPrefix: string,
  stepCount: number,
): RoutineStepInput {
  return {
    id: `${idPrefix}-${stepCount}-${Date.now()}`,
    stepOrder: stepCount,
    inventoryProductId: null,
    stepLabel: StepLabel.Cleanser,
    customLabel: null,
    notes: null,
    optional: false,
  };
}

export function getRoutineStepProduct(
  step: RoutineStepInput,
  productLookup: Map<string, RoutineStepProductSummary>,
): RoutineStepProductSummary | null {
  if (!step.inventoryProductId) {
    return null;
  }

  return productLookup.get(step.inventoryProductId) ?? null;
}
