'use client';

import {
  ProductAboutSection,
  ProductHowToUseSection,
  ProductIdentitySection,
} from './form/product-form-sections';
import {
  ProductManufacturerSection,
  ProductUserFieldsSection,
} from './form/product-form-metadata-sections';
import type {
  ApplicationGuidance,
  CatalogueIdentity,
  ManufacturerInfo,
  ShelfProductFormValue,
  UserFields,
} from '@/types/shelf';
import type { ShelfFormFieldErrors } from '@/lib/shelf-form';

export type ProductFormValue = ShelfProductFormValue;
export type ProductFormGuidanceErrors = {
  steps?: string;
  cautions?: string;
};
export type ProductFormReviewFields = Partial<
  Record<
    | 'identity.sizeMl'
    | 'identity.description'
    | 'identity.benefits'
    | 'identity.suitedFor'
    | 'identity.inciIngredients'
    | 'guidance'
    | 'manufacturer.parentCompany'
    | 'manufacturer.countryOfManufacture'
    | 'manufacturer.supportEmail'
    | 'manufacturer.productUrl',
    boolean
  >
>;

type ProductFormBodyProps = {
  value: ProductFormValue;
  onIdentityChange: (next: CatalogueIdentity) => void;
  onManufacturerChange: (next: ManufacturerInfo) => void;
  onUserFieldsChange: (next: UserFields) => void;
  onGuidanceChange: (next: ApplicationGuidance) => void;
  fieldErrors?: ShelfFormFieldErrors;
  guidanceErrors?: ProductFormGuidanceErrors;
  identityReadOnly?: boolean;
  identitySourceLabel?: string;
  reviewFields?: ProductFormReviewFields;
};

export function ProductFormBody({
  value,
  onIdentityChange,
  onManufacturerChange,
  onUserFieldsChange,
  onGuidanceChange,
  fieldErrors,
  guidanceErrors,
  identityReadOnly = false,
  identitySourceLabel,
  reviewFields,
}: ProductFormBodyProps) {
  const patchIdentity = (patch: Partial<CatalogueIdentity>) =>
    onIdentityChange({ ...value.identity, ...patch });

  const patchManufacturer = (patch: Partial<ManufacturerInfo>) =>
    onManufacturerChange({ ...value.manufacturer, ...patch });

  const patchUserFields = (patch: Partial<UserFields>) =>
    onUserFieldsChange({ ...value.userFields, ...patch });

  const patchGuidance = (guidance: ApplicationGuidance) =>
    onGuidanceChange(guidance);

  return (
    <div className="flex flex-col gap-8">
      <ProductIdentitySection
        identity={value.identity}
        onChange={patchIdentity}
        fieldErrors={fieldErrors}
        identityReadOnly={identityReadOnly}
        identitySourceLabel={identitySourceLabel}
        reviewFields={reviewFields}
      />
      <ProductAboutSection
        identity={value.identity}
        onChange={patchIdentity}
        fieldErrors={fieldErrors}
        identityReadOnly={identityReadOnly}
        identitySourceLabel={identitySourceLabel}
        reviewFields={reviewFields}
      />
      <ProductUserFieldsSection
        userFields={value.userFields}
        onChange={patchUserFields}
        fieldErrors={fieldErrors}
      />
      <ProductHowToUseSection
        guidance={value.guidance}
        onChange={patchGuidance}
        errors={guidanceErrors}
        reviewFields={reviewFields}
      />
      <ProductManufacturerSection
        manufacturer={value.manufacturer}
        onChange={patchManufacturer}
        fieldErrors={fieldErrors}
        reviewFields={reviewFields}
      />
    </div>
  );
}
