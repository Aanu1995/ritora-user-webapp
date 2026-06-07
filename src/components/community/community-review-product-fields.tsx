"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCheck, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ShelfProduct } from "@/types/shelf";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  CommunityFieldError,
  CommunitySimpleSelect,
  Field,
  FormGrid,
} from "./community-shared";

/* ===========================================================
 * Product picker that progressively discloses the manual-entry
 * fields.
 *
 * Three states:
 *   - 'shelf': user picked a product from their shelf. Manual
 *     fields are hidden and we show a confirmation chip.
 *   - 'other': user picked "Other (not on my shelf)". Manual
 *     brand / product / category fields appear, empty and
 *     ready to fill.
 *   - 'unset': nothing picked yet. Only the dropdown shows so
 *     the form doesn't feel busy on first sight.
 * ========================================================= */

const OTHER_PRODUCT_VALUE = "__other__";

export type CommunityReviewStringField = {
  handleBlur: () => void;
  handleChange: (value: string) => void;
  name: string;
  state: {
    meta: { errors: readonly unknown[] };
    value: string;
  };
};

type Props = {
  brandHint?: string;
  brandLabel?: string;
  brandPlaceholder?: string;
  brandRequired?: boolean;
  brandField: CommunityReviewStringField;
  categoryHint?: string;
  categoryLabel?: string;
  categoryField: CommunityReviewStringField;
  isLoadingProducts: boolean;
  linkedMessage?: string;
  manualHeading?: string;
  nameField: CommunityReviewStringField;
  productHint?: string;
  productLabel?: string;
  productPlaceholder?: string;
  selectedShelfProductIdField: CommunityReviewStringField;
  selectHint?: string;
  selectLabel?: string;
  products: ShelfProduct[];
};

export function CommunityReviewProductFields({
  brandHint,
  brandField,
  brandLabel,
  brandPlaceholder,
  brandRequired = true,
  categoryHint,
  categoryField,
  categoryLabel,
  isLoadingProducts,
  linkedMessage,
  manualHeading,
  nameField,
  productHint,
  productLabel,
  productPlaceholder,
  products,
  selectedShelfProductIdField,
  selectHint,
  selectLabel,
}: Props) {
  const t = useTranslations("community.productPicker");
  const options = useCommunityTranslatedOptions();
  const selectedShelfId = selectedShelfProductIdField.state.value;
  const selectedFromShelf = Boolean(selectedShelfId);

  // Carry a local UI flag for "Other" because the form schema only knows
  // about a real shelf id or an empty string. We seed it true when the
  // user has typed a brand/name manually so editing a draft doesn't hide
  // their previous text.
  const [otherMode, setOtherMode] = useState(
    () => Boolean(brandField.state.value) || Boolean(nameField.state.value),
  );

  // Picking a shelf product overrides the otherMode flag — the
  // derivation keeps the two in sync without a state-sync cascade.
  const effectiveOther = !selectedFromShelf && otherMode;
  const dropdownValue = selectedFromShelf
    ? selectedShelfId
    : effectiveOther
      ? OTHER_PRODUCT_VALUE
      : "";

  const shelfOptions = useMemo(() => {
    const productOptions = products.map((product) => ({
      value: product.id,
      label: `${product.identity.brand} ${product.identity.name}`,
    }));
    const hasSelectedProduct = productOptions.some(
      (option) => option.value === selectedShelfId,
    );
    const selectedSnapshotOption =
      selectedShelfId && !hasSelectedProduct
        ? [
            {
              value: selectedShelfId,
              label:
                `${brandField.state.value} ${nameField.state.value}`.trim() ||
                t("linkedMessage"),
            },
          ]
        : [];

    return [
      ...selectedSnapshotOption,
      ...productOptions,
      { value: OTHER_PRODUCT_VALUE, label: t("otherProduct") },
    ];
  }, [
    brandField.state.value,
    nameField.state.value,
    products,
    selectedShelfId,
    t,
  ]);

  const handleDropdownChange = (next: string) => {
    if (next === "") {
      selectedShelfProductIdField.handleChange("");
      brandField.handleChange("");
      nameField.handleChange("");
      setOtherMode(false);
      return;
    }
    if (next === OTHER_PRODUCT_VALUE) {
      selectedShelfProductIdField.handleChange("");
      brandField.handleChange("");
      nameField.handleChange("");
      setOtherMode(true);
      return;
    }
    setOtherMode(false);
    selectedShelfProductIdField.handleChange(next);
    const product = products.find((item) => item.id === next);
    if (!product) return;
    brandField.handleChange(product.identity.brand);
    categoryField.handleChange(product.identity.category);
    nameField.handleChange(product.identity.name);
  };

  return (
    <div className="grid gap-5">
      <CommunitySimpleSelect
        label={selectLabel ?? t("selectLabel")}
        name={selectedShelfProductIdField.name}
        hint={selectHint ?? t("selectHint")}
        placeholder={isLoadingProducts ? t("loadingShelf") : t("pickProduct")}
        disabled={isLoadingProducts}
        options={shelfOptions}
        required
        value={dropdownValue}
        onChange={handleDropdownChange}
      />

      {selectedFromShelf ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong">
          <PackageCheck className="h-4 w-4" />
          {linkedMessage ?? t("linkedMessage")}
        </div>
      ) : null}

      {effectiveOther ? (
        <div className="grid gap-5 rounded-xl border border-dashed border-border bg-surface-muted/40 p-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
            <Pencil className="h-4 w-4" />
            {manualHeading ?? t("manualHeading")}
          </div>
          <FormGrid>
            <ReviewTextInput
              field={brandField}
              hint={brandHint ?? t("brandHint")}
              label={brandLabel ?? t("brandLabel")}
              placeholder={brandPlaceholder ?? t("brandPlaceholder")}
              required={brandRequired}
            />
            <ReviewTextInput
              field={nameField}
              hint={productHint ?? t("productHint")}
              label={productLabel ?? t("productLabel")}
              placeholder={productPlaceholder ?? t("productPlaceholder")}
              required
            />
          </FormGrid>
          <Field
            hint={categoryHint ?? t("categoryHint")}
            label={categoryLabel ?? t("categoryLabel")}
            required
          >
            <CommunitySimpleSelect
              name={categoryField.name}
              options={options.productCategories}
              value={categoryField.state.value}
              onChange={(next) => categoryField.handleChange(next)}
              required
            />
            <CommunityFieldError errors={categoryField.state.meta.errors} />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

function ReviewTextInput({
  disabled,
  field,
  hint,
  label,
  placeholder,
  required,
}: {
  disabled?: boolean;
  field: CommunityReviewStringField;
  hint: string;
  label: string;
  placeholder: string;
  required: boolean;
}) {
  const invalid = field.state.meta.errors.length > 0;
  return (
    <Field hint={hint} label={label} required={required}>
      <Input
        name={field.name}
        value={field.state.value}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(
          invalid && "border-danger focus-visible:ring-danger/30",
          disabled && "opacity-70",
        )}
      />
      <CommunityFieldError errors={field.state.meta.errors} />
    </Field>
  );
}
