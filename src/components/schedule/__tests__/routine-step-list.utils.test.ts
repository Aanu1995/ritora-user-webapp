import {
  buildProductLookup,
  createRoutineStepInput,
  findRoutineStepIndexByRowId,
  getRoutineStepProduct,
  getRoutineStepRowId,
  removeRoutineStepAtIndex,
  replaceRoutineStepAtIndex,
  stepsFromEntity,
} from "../routine-step-list.utils";
import {
  StepLabel,
  type RoutineStep,
  type RoutineStepInput,
  type RoutineStepProductSummary,
} from "@/types/schedule";

const PRODUCT: RoutineStepProductSummary = {
  id: "product-1",
  brand: "CeraVe",
  name: "Cleanser",
  category: "cleanser",
  imageUrl: null,
  status: "active",
};

function createEntityStep(
  id: string,
  stepOrder: number,
  product: RoutineStepProductSummary | null = null,
): RoutineStep {
  return {
    id,
    stepOrder,
    inventoryProductId: product?.id ?? null,
    stepLabel: StepLabel.Cleanser,
    customLabel: null,
    notes: null,
    optional: false,
    isSpecialistLocked: false,
    product,
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
  };
}

describe("routine step list utils", () => {
  it("normalizes entity steps into sorted form inputs", () => {
    expect(
      stepsFromEntity([
        createEntityStep("step-2", 2),
        createEntityStep("step-1", 0),
      ]),
    ).toEqual([
      expect.objectContaining({ id: "step-1", stepOrder: 0 }),
      expect.objectContaining({ id: "step-2", stepOrder: 1 }),
    ]);
  });

  it("builds product lookups only from steps with products", () => {
    const lookup = buildProductLookup([
      createEntityStep("step-1", 0, PRODUCT),
      createEntityStep("step-2", 1),
    ]);

    expect(lookup.get(PRODUCT.id)).toBe(PRODUCT);
    expect(lookup.size).toBe(1);
  });

  it("finds, replaces, and removes rows by stable row ids", () => {
    const steps: RoutineStepInput[] = [
      {
        id: "step-1",
        stepOrder: 0,
        inventoryProductId: null,
        stepLabel: StepLabel.Cleanser,
      },
      {
        stepOrder: 1,
        inventoryProductId: null,
        stepLabel: StepLabel.Serum,
      },
    ];
    const replacement = {
      ...steps[0],
      stepLabel: StepLabel.Moisturizer,
    };

    expect(getRoutineStepRowId(steps[0], 0)).toBe("step-1");
    expect(getRoutineStepRowId(steps[1], 1)).toBe("new-1");
    expect(findRoutineStepIndexByRowId(steps, "new-1")).toBe(1);
    expect(replaceRoutineStepAtIndex(steps, 0, replacement)[0]).toEqual(
      replacement,
    );
    expect(removeRoutineStepAtIndex(steps, 0)).toEqual([
      expect.objectContaining({ stepLabel: StepLabel.Serum, stepOrder: 0 }),
    ]);
  });

  it("creates empty inputs and resolves selected products", () => {
    const step = createRoutineStepInput("slot", 2);
    const lookup = new Map([[PRODUCT.id, PRODUCT]]);

    expect(step).toEqual({
      id: expect.stringMatching(/^slot-2-\d+$/),
      stepOrder: 2,
      inventoryProductId: null,
      stepLabel: StepLabel.Cleanser,
      customLabel: null,
      notes: null,
      optional: false,
      isSpecialistLocked: false,
    });
    expect(getRoutineStepProduct(step, lookup)).toBeNull();
    expect(
      getRoutineStepProduct(
        {
          ...step,
          inventoryProductId: PRODUCT.id,
        },
        lookup,
      ),
    ).toBe(PRODUCT);
    expect(
      getRoutineStepProduct(
        {
          ...step,
          inventoryProductId: "missing",
        },
        lookup,
      ),
    ).toBeNull();
  });
});
