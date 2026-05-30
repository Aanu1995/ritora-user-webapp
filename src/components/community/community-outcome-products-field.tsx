"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import type { ShelfProduct } from "@/types/shelf";
import type { CommunityOutcomeSignalFormValues } from "./community-form-schemas";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import { communityReviewShelfFilters } from "./community-write-review-form-config";
import {
  CommunityFieldError,
  CommunitySimpleSelect,
  Field,
  FormGrid,
} from "./community-shared";

const OTHER_PRODUCT_VALUE = "__other__";
const MAX_OUTCOME_PRODUCTS = 10;

type OutcomeProductValue =
  CommunityOutcomeSignalFormValues["usedWithProducts"][number];

type OutcomeProductsFieldProps = {
  errors: readonly unknown[];
  isLoadingProducts: boolean;
  onChange: (products: OutcomeProductValue[]) => void;
  products: ShelfProduct[];
  value: OutcomeProductValue[];
};

const blankOutcomeProduct: OutcomeProductValue = {
  category: "cleanser",
  productBrand: "",
  productId: "",
  productName: "",
};

export function CommunityOutcomeProductsFieldFromShelf({
  errors,
  onChange,
  value,
}: Pick<
  OutcomeProductsFieldProps,
  "errors" | "onChange" | "value"
>) {
  const dateContext = useShelfDateContext();
  const shelfProducts = useShelfProducts(
    communityReviewShelfFilters,
    dateContext,
  );
  return (
    <CommunityOutcomeProductsField
      errors={errors}
      isLoadingProducts={shelfProducts.isLoading}
      onChange={onChange}
      products={shelfProducts.data ?? []}
      value={value}
    />
  );
}

export function CommunityOutcomeProductsField({
  errors,
  isLoadingProducts,
  onChange,
  products,
  value,
}: OutcomeProductsFieldProps) {
  const t = useTranslations("community.outcomeSignals");
  const options = useCommunityTranslatedOptions();
  const [otherProducts, setOtherProducts] = useState<Set<number>>(
    () =>
      new Set(
        value
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

  const addProduct = () => {
    if (value.length >= MAX_OUTCOME_PRODUCTS) return;
    onChange([...value, { ...blankOutcomeProduct }]);
  };
  const removeProduct = (index: number) => {
    onChange(value.filter((_item, itemIndex) => itemIndex !== index));
    setOtherProducts((current) => {
      const shifted = new Set<number>();
      current.forEach((itemIndex) => {
        if (itemIndex < index) shifted.add(itemIndex);
        if (itemIndex > index) shifted.add(itemIndex - 1);
      });
      return shifted;
    });
  };
  const updateProduct = (
    index: number,
    patch: Partial<OutcomeProductValue>,
  ) => {
    onChange(
      value.map((item, itemIndex) =>
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

  return (
    <Field label={t("usedWithProducts")} hint={t("usedWithProductsHint")}>
      {value.length > 0 ? (
        <div className="grid gap-3">
          {value.map((item, index) => (
            <OutcomeProductRow
              key={`outcome-product-${index}`}
              index={index}
              isLoadingProducts={isLoadingProducts}
              isOther={otherProducts.has(index)}
              item={item}
              onRemove={() => removeProduct(index)}
              onSetOther={(next) => setOther(index, next)}
              onUpdate={(patch) => updateProduct(index, patch)}
              productCategoryOptions={options.productCategories}
              products={products}
              shelfOptions={shelfOptions}
            />
          ))}
        </div>
      ) : null}
      <CommunityFieldError errors={errors} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3 w-full sm:w-auto"
        disabled={value.length >= MAX_OUTCOME_PRODUCTS}
        onClick={addProduct}
      >
        <Plus className="h-4 w-4" />
        {t("addUsedWithProduct")}
      </Button>
    </Field>
  );
}

function OutcomeProductRow({
  index,
  isLoadingProducts,
  isOther,
  item,
  onRemove,
  onSetOther,
  onUpdate,
  productCategoryOptions,
  products,
  shelfOptions,
}: {
  index: number;
  isLoadingProducts: boolean;
  isOther: boolean;
  item: OutcomeProductValue;
  onRemove: () => void;
  onSetOther: (next: boolean) => void;
  onUpdate: (patch: Partial<OutcomeProductValue>) => void;
  productCategoryOptions: readonly { value: string; label: string }[];
  products: ShelfProduct[];
  shelfOptions: readonly { value: string; label: string }[];
}) {
  const t = useTranslations("community.outcomeSignals");
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
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <PackageCheck className="h-4 w-4 text-accent" />
          {t("usedWithProduct", { number: index + 1 })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={t("removeUsedWithProduct", { number: index + 1 })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        <FormGrid>
          <CommunitySimpleSelect
            label={t("usedWithProductSelect")}
            name={`usedWithProducts.${index}.productId`}
            placeholder={
              isLoadingProducts ? t("loadingShelf") : t("pickProduct")
            }
            disabled={isLoadingProducts}
            options={[...currentProductOption, ...shelfOptions]}
            value={dropdownValue}
            onChange={handleProductChange}
          />
          <CommunitySimpleSelect
            label={t("usedWithProductRole")}
            name={`usedWithProducts.${index}.category`}
            options={productCategoryOptions}
            value={item.category}
            onChange={(next) => onUpdate({ category: next })}
            required
          />
        </FormGrid>

        {fromShelf ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong">
            <PackageCheck className="h-4 w-4" />
            {t("linked")}
          </div>
        ) : null}

        {effectiveOther ? (
          <div className="grid gap-4 rounded-xl border border-dashed border-border bg-surface-muted/40 p-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
              <Pencil className="h-4 w-4" />
              {t("manualUsedWithHeading")}
            </div>
            <FormGrid>
              <Field label={t("manualUsedWithBrand")}>
                <Input
                  name={`usedWithProducts.${index}.productBrand`}
                  value={item.productBrand}
                  placeholder={t("manualUsedWithBrandPlaceholder")}
                  onChange={(event) =>
                    onUpdate({ productBrand: event.target.value })
                  }
                />
              </Field>
              <Field label={t("manualUsedWithProduct")} required>
                <Input
                  name={`usedWithProducts.${index}.productName`}
                  value={item.productName}
                  placeholder={t("manualUsedWithProductPlaceholder")}
                  onChange={(event) =>
                    onUpdate({ productName: event.target.value })
                  }
                />
              </Field>
            </FormGrid>
          </div>
        ) : null}
      </div>
    </div>
  );
}
