"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShelfProduct } from "@/types/shelf";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import type { CommunityRoutineFormValues } from "./community-form-schemas";
import {
  CommunityFieldError,
  CommunitySimpleSelect,
  CommunityTextarea,
  Field,
  FormGrid,
} from "./community-shared";

/* ===========================================================
 * Per-step "Other" mode. The shelf dropdown gains a sentinel
 * option; picking it reveals the manual brand / product inputs
 * for that step. Manual fields stay hidden by default so the
 * builder feels focused.
 * ========================================================= */

const OTHER_PRODUCT_VALUE = "__other__";

type PlaybookStepValue = CommunityRoutineFormValues["steps"][number];

type Props = {
  errors: readonly unknown[];
  isLoadingProducts: boolean;
  onChange: (steps: PlaybookStepValue[]) => void;
  products: ShelfProduct[];
  value: PlaybookStepValue[];
};

const blankStep: PlaybookStepValue = {
  category: "cleanser",
  frequency: "daily",
  notes: "",
  productBrand: "",
  productId: "",
  productName: "",
  slot: "pm",
};

export function CommunityPlaybookStepsField({
  errors,
  isLoadingProducts,
  onChange,
  products,
  value,
}: Props) {
  const t = useTranslations("community.playbookSteps");
  const options = useCommunityTranslatedOptions();
  const steps = value.length > 0 ? value : [blankStep];

  // Track which step rows are in manual-entry ("Other") mode. Seeded
  // from steps with manual brand/name but no shelf product id so edit
  // flows keep showing the fields the user already filled in.
  const [otherSteps, setOtherSteps] = useState<Set<number>>(
    () =>
      new Set(
        steps
          .map((step, index) =>
            !step.productId && (step.productBrand || step.productName)
              ? index
              : -1,
          )
          .filter((index) => index >= 0),
      ),
  );

  const shelfOptions = useMemo(
    () => [
      ...products.map((product) => ({
        value: product.id,
        label: `${product.identity.brand} ${product.identity.name}`,
      })),
      { value: OTHER_PRODUCT_VALUE, label: t("otherProduct") },
    ],
    [products, t],
  );

  const slotOptions = options.reviewRoutineSlots.filter(
    (option) => option.value !== "am-pm",
  );

  const updateStep = (index: number, patch: Partial<PlaybookStepValue>) => {
    onChange(
      steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step,
      ),
    );
  };

  const setOther = (index: number, next: boolean) => {
    setOtherSteps((current) => {
      const copy = new Set(current);
      if (next) copy.add(index);
      else copy.delete(index);
      return copy;
    });
  };

  const addStep = () => onChange([...steps, { ...blankStep }]);
  const removeStep = (index: number) => {
    onChange(steps.filter((_step, stepIndex) => stepIndex !== index));
    setOther(index, false);
  };

  return (
    <Field
      label={t("label")}
      hint={t("hint")}
      required
    >
      <div className="grid gap-4">
        {steps.map((step, index) => (
          <div
            key={`playbook-step-${index}`}
            className="rounded-xl border border-border bg-background p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <PackageCheck className="h-4 w-4 text-accent" />
                {t("step", { number: index + 1 })}
              </span>
              {steps.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  aria-label={t("removeStep", { number: index + 1 })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            {(() => {
              const isOther = otherSteps.has(index);
              const fromShelf = Boolean(step.productId);
              const dropdownValue = fromShelf
                ? step.productId
                : isOther
                  ? OTHER_PRODUCT_VALUE
                  : "";
              return (
                <div className="grid gap-5">
                  <FormGrid>
                    <CommunitySimpleSelect
                      label={t("product")}
                      name={`steps.${index}.productId`}
                      placeholder={
                        isLoadingProducts
                          ? t("loadingShelf")
                          : t("pickProduct")
                      }
                      disabled={isLoadingProducts}
                      options={shelfOptions}
                      value={dropdownValue}
                      onChange={(next) => {
                        if (next === OTHER_PRODUCT_VALUE) {
                          setOther(index, true);
                          updateStep(index, {
                            productId: "",
                            productBrand: "",
                            productName: "",
                          });
                          return;
                        }
                        setOther(index, false);
                        const product = products.find(
                          (item) => item.id === next,
                        );
                        updateStep(index, {
                          category:
                            product?.identity.category ?? step.category,
                          productBrand: product?.identity.brand ?? "",
                          productId: next,
                          productName: product?.identity.name ?? "",
                        });
                      }}
                    />
                    <CommunitySimpleSelect
                      label={t("productRole")}
                      name={`steps.${index}.category`}
                      options={options.productCategories}
                      value={step.category}
                      onChange={(next) =>
                        updateStep(index, { category: next })
                      }
                      required
                    />
                    <CommunitySimpleSelect
                      label={t("slot")}
                      name={`steps.${index}.slot`}
                      options={slotOptions}
                      value={step.slot}
                      onChange={(next) =>
                        updateStep(index, {
                          slot: next as PlaybookStepValue["slot"],
                        })
                      }
                      required
                    />
                    <CommunitySimpleSelect
                      label={t("frequency")}
                      name={`steps.${index}.frequency`}
                      options={options.reviewFrequencies}
                      value={step.frequency}
                      onChange={(next) =>
                        updateStep(index, { frequency: next })
                      }
                      required
                    />
                  </FormGrid>
                  {fromShelf ? (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong">
                      <PackageCheck className="h-4 w-4" />
                      {t("linked")}
                    </div>
                  ) : null}
                  {isOther ? (
                    <div className="grid gap-4 rounded-xl border border-dashed border-border bg-surface-muted/40 p-4">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                        <Pencil className="h-4 w-4" />
                        {t("manualHeading")}
                      </div>
                      <FormGrid>
                        <Field label={t("brand")} required>
                          <Input
                            name={`steps.${index}.productBrand`}
                            value={step.productBrand}
                            placeholder={t("brandPlaceholder")}
                            onChange={(event) =>
                              updateStep(index, {
                                productBrand: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label={t("productName")} required>
                          <Input
                            name={`steps.${index}.productName`}
                            value={step.productName}
                            placeholder={t("productPlaceholder")}
                            onChange={(event) =>
                              updateStep(index, {
                                productName: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </FormGrid>
                    </div>
                  ) : null}
                </div>
              );
            })()}
            <div className="mt-5">
              <Field
                hint={t("noteHint")}
                label={t("note")}
              >
                <CommunityTextarea
                  name={`steps.${index}.notes`}
                  value={step.notes}
                  onChange={(event) =>
                    updateStep(index, { notes: event.target.value })
                  }
                  maxLength={500}
                  className="min-h-20"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <CommunityFieldError errors={errors} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-4 w-full sm:w-auto"
        onClick={addStep}
      >
        <Plus className="h-4 w-4" />
        {t("addStep")}
      </Button>
    </Field>
  );
}
