"use client";

import type { ComponentProps, ReactNode } from "react";
import type { ShelfProduct } from "@/types/shelf";
import {
  CommunityReviewProductFields,
  type CommunityReviewStringField,
} from "./community-review-product-fields";

export type CommunityReviewProductFieldName =
  | "contextCategory"
  | "contextProductBrand"
  | "contextProductName"
  | "productBrand"
  | "productCategory"
  | "productName"
  | "selectedContextShelfProductId"
  | "selectedShelfProductId";

export type CommunityReviewFormFieldRenderer = <
  TName extends CommunityReviewProductFieldName,
>(props: {
  children: (field: CommunityReviewStringField) => ReactNode;
  name: TName;
}) => ReactNode;

type ProductPickerCopy = Pick<
  ComponentProps<typeof CommunityReviewProductFields>,
  | "brandHint"
  | "brandLabel"
  | "brandPlaceholder"
  | "brandRequired"
  | "categoryHint"
  | "categoryLabel"
  | "linkedMessage"
  | "manualHeading"
  | "productHint"
  | "productLabel"
  | "productPlaceholder"
  | "selectHint"
  | "selectLabel"
>;

export type CommunityReviewProductFieldGroupProps = ProductPickerCopy & {
  brandName: "productBrand" | "contextProductBrand";
  categoryName: "productCategory" | "contextCategory";
  fieldRenderer: CommunityReviewFormFieldRenderer;
  isLoadingProducts: boolean;
  nameName: "productName" | "contextProductName";
  products: ShelfProduct[];
  selectedName: "selectedShelfProductId" | "selectedContextShelfProductId";
};

export function CommunityReviewProductFieldGroup({
  brandName,
  categoryName,
  fieldRenderer,
  isLoadingProducts,
  nameName,
  products,
  selectedName,
  ...pickerCopy
}: CommunityReviewProductFieldGroupProps) {
  const FormField = fieldRenderer;

  return (
    <FormField name={selectedName}>
      {(selectedShelfProductIdField) => (
        <FormField name={brandName}>
          {(brandField) => (
            <FormField name={nameName}>
              {(nameField) => (
                <FormField name={categoryName}>
                  {(categoryField) => (
                    <CommunityReviewProductFields
                      brandField={brandField}
                      categoryField={categoryField}
                      isLoadingProducts={isLoadingProducts}
                      nameField={nameField}
                      products={products}
                      selectedShelfProductIdField={selectedShelfProductIdField}
                      {...pickerCopy}
                    />
                  )}
                </FormField>
              )}
            </FormField>
          )}
        </FormField>
      )}
    </FormField>
  );
}
