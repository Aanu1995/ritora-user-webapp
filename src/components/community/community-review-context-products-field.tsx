"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShelfProduct } from "@/types/shelf";
import type { CommunityReviewFormValues } from "./community-form-schemas";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  CommunityFieldError,
  CommunitySimpleSelect,
  Field,
  FormGrid,
} from "./community-shared";

const OTHER_PRODUCT_VALUE = "__other__";
const MAX_CONTEXT_PRODUCTS = 20;

type ReviewContextProductValue =
  CommunityReviewFormValues["routineContext"][number];

type Props = {
  contextErrors: readonly unknown[];
  contextUsageErrors: readonly unknown[];
  contextUsageValue: string;
  isLoadingProducts: boolean;
  onContextChange: (products: ReviewContextProductValue[]) => void;
  onContextUsageChange: (usage: string) => void;
  products: ShelfProduct[];
  value: ReviewContextProductValue[];
};

const blankContextProduct: ReviewContextProductValue = {
  category: "cleanser",
  productBrand: "",
  productId: "",
  productName: "",
};

export function CommunityReviewContextProductsField({
  contextErrors,
  contextUsageErrors,
  contextUsageValue,
  isLoadingProducts,
  onContextChange,
  onContextUsageChange,
  products,
  value,
}: Props) {
  const t = useTranslations("community.reviewContextProducts");
  const options = useCommunityTranslatedOptions();
  const contextProducts = value;
  const [otherProducts, setOtherProducts] = useState<Set<number>>(
    () =>
      new Set(
        contextProducts
          .map((item, index) =>
            !item.productId && (item.productBrand || item.productName)
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

  const updateContextProduct = (
    index: number,
    patch: Partial<ReviewContextProductValue>,
  ) => {
    onContextChange(
      contextProducts.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const setOther = (index: number, next: boolean) => {
    setOtherProducts((current) => {
      const copy = new Set(current);
      if (next) copy.add(index);
      else copy.delete(index);
      return copy;
    });
  };

  const addContextProduct = () => {
    if (contextProducts.length >= MAX_CONTEXT_PRODUCTS) return;
    onContextChange([...contextProducts, { ...blankContextProduct }]);
  };

  const removeContextProduct = (index: number) => {
    onContextChange(
      contextProducts.filter((_item, itemIndex) => itemIndex !== index),
    );
    setOtherProducts((current) => {
      const shifted = new Set<number>();
      current.forEach((itemIndex) => {
        if (itemIndex < index) shifted.add(itemIndex);
        if (itemIndex > index) shifted.add(itemIndex - 1);
      });
      return shifted;
    });
  };

  const handleUsageChange = (next: string) => {
    onContextUsageChange(next);
    if (next === "with_products" && contextProducts.length === 0) {
      onContextChange([{ ...blankContextProduct }]);
      return;
    }
    if (next !== "with_products") {
      onContextChange([]);
      setOtherProducts(new Set());
    }
  };

  return (
    <div className="grid gap-4">
      <CommunitySimpleSelect
        label={t("usageLabel")}
        name="routineContextUsage"
        hint={t("usageHint")}
        placeholder={t("usagePlaceholder")}
        options={options.reviewRoutineContextUsages}
        required
        value={contextUsageValue}
        onChange={handleUsageChange}
      />
      <CommunityFieldError errors={contextUsageErrors} />

      {/* Both confirmation notices ("used alone" / "not sure")
          share one calm muted treatment now. Previously the
          "used_alone" notice was loud accent-soft + accent-strong
          text — same visual weight as a primary CTA, which over-
          rewarded a state that's just "noted, nothing else to
          add." The neutral surface treatment reads as
          informational rather than celebratory. */}
      {contextUsageValue === "used_alone" || contextUsageValue === "not_sure" ? (
        <p className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
          {contextUsageValue === "used_alone"
            ? t("usedAloneNote")
            : t("notSureNote")}
        </p>
      ) : null}

      {contextUsageValue === "with_products" ? (
        <Field label={t("productsLabel")} hint={t("productsHint")} required>
          <div className="grid gap-3">
            {contextProducts.map((item, index) => (
              <ReviewContextProductRow
                key={`review-context-product-${index}`}
                index={index}
                isLoadingProducts={isLoadingProducts}
                isOther={otherProducts.has(index)}
                item={item}
                onRemove={
                  contextProducts.length > 1
                    ? () => removeContextProduct(index)
                    : undefined
                }
                onSetOther={(next) => setOther(index, next)}
                onUpdate={(patch) => updateContextProduct(index, patch)}
                options={options.productCategories}
                products={products}
                shelfOptions={shelfOptions}
              />
            ))}
          </div>
          <CommunityFieldError errors={contextErrors} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 w-full sm:w-auto"
            disabled={contextProducts.length >= MAX_CONTEXT_PRODUCTS}
            onClick={addContextProduct}
          >
            <Plus className="h-4 w-4" />
            {t("addProduct")}
          </Button>
        </Field>
      ) : null}
    </div>
  );
}

function ReviewContextProductRow({
  index,
  isLoadingProducts,
  isOther,
  item,
  onRemove,
  onSetOther,
  onUpdate,
  options,
  products,
  shelfOptions,
}: {
  index: number;
  isLoadingProducts: boolean;
  isOther: boolean;
  item: ReviewContextProductValue;
  onRemove?: () => void;
  onSetOther: (next: boolean) => void;
  onUpdate: (patch: Partial<ReviewContextProductValue>) => void;
  options: readonly { value: string; label: string }[];
  products: ShelfProduct[];
  shelfOptions: readonly { value: string; label: string }[];
}) {
  const t = useTranslations("community.reviewContextProducts");
  const fromShelf = Boolean(item.productId);
  const hasManualProduct = Boolean(item.productBrand || item.productName);
  const effectiveOther = !fromShelf && (isOther || hasManualProduct);
  const dropdownValue = fromShelf
    ? item.productId
    : effectiveOther
      ? OTHER_PRODUCT_VALUE
      : "";
  const currentProductOption =
    fromShelf && !shelfOptions.some((option) => option.value === item.productId)
      ? [
          {
            value: item.productId,
            label:
              `${item.productBrand} ${item.productName}`.trim() || t("linked"),
          },
        ]
      : [];

  const handleProductChange = (next: string) => {
    if (next === "") {
      onSetOther(false);
      onUpdate({ productBrand: "", productId: "", productName: "" });
      return;
    }
    if (next === OTHER_PRODUCT_VALUE) {
      onSetOther(true);
      onUpdate({ productBrand: "", productId: "", productName: "" });
      return;
    }
    onSetOther(false);
    const product = products.find((candidate) => candidate.id === next);
    if (!product) {
      onUpdate({ productId: next });
      return;
    }
    onUpdate({
      category: product.identity.category,
      productBrand: product.identity.brand,
      productId: product.id,
      productName: product.identity.name,
    });
  };

  return (
    /* Lighter row chrome: `bg-surface-muted/50 p-4` instead of
       `bg-background p-5`. Sits softly inside the parent
       FormSection without competing as another full card. */
    <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted">
          {t("product", { number: index + 1 })}
        </span>
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={t("removeProduct", { number: index + 1 })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4">
        <FormGrid>
          <CommunitySimpleSelect
            label={t("selectLabel")}
            name={`routineContext.${index}.productId`}
            placeholder={
              isLoadingProducts ? t("loadingShelf") : t("pickProduct")
            }
            disabled={isLoadingProducts}
            options={[...currentProductOption, ...shelfOptions]}
            value={dropdownValue}
            onChange={handleProductChange}
          />
          <CommunitySimpleSelect
            label={t("categoryLabel")}
            name={`routineContext.${index}.category`}
            options={options}
            value={item.category}
            onChange={(next) => onUpdate({ category: next })}
            required
          />
        </FormGrid>

        {/* Shelf-picked rows used to render an additional "Linked"
            chip below the dropdown, but the dropdown's own selected
            value already conveys that fact. Removed to cut visual
            noise. Manual entries reveal the brand + name inputs
            inline (no nested dashed-border card) so the row reads
            as one cohesive group instead of card-in-card. */}
        {effectiveOther ? (
          <FormGrid>
            <Field label={t("brandLabel")} hint={t("brandHint")}>
              <Input
                name={`routineContext.${index}.productBrand`}
                value={item.productBrand}
                placeholder={t("brandPlaceholder")}
                onChange={(event) =>
                  onUpdate({ productBrand: event.target.value })
                }
              />
            </Field>
            <Field
              label={t("productNameLabel")}
              hint={t("productNameHint")}
              required
            >
              <Input
                name={`routineContext.${index}.productName`}
                value={item.productName}
                placeholder={t("productNamePlaceholder")}
                onChange={(event) =>
                  onUpdate({ productName: event.target.value })
                }
              />
            </Field>
          </FormGrid>
        ) : null}
      </div>
    </div>
  );
}
