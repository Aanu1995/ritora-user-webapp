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

export type ProductFormValue = ShelfProductFormValue;

type ProductFormBodyProps = {
  value: ProductFormValue;
  onChange: (next: ProductFormValue) => void;
  identityReadOnly?: boolean;
  identitySourceLabel?: string;
};

export function ProductFormBody({
  value,
  onChange,
  identityReadOnly = false,
  identitySourceLabel,
}: ProductFormBodyProps) {
  const patchIdentity = (patch: Partial<CatalogueIdentity>) =>
    onChange({ ...value, identity: { ...value.identity, ...patch } });

  const patchManufacturer = (patch: Partial<ManufacturerInfo>) =>
    onChange({
      ...value,
      manufacturer: { ...value.manufacturer, ...patch },
    });

  const patchUserFields = (patch: Partial<UserFields>) =>
    onChange({
      ...value,
      userFields: { ...value.userFields, ...patch },
    });

  const patchGuidance = (guidance: ApplicationGuidance) =>
    onChange({ ...value, guidance });

  return (
    <div className="flex flex-col gap-8">
      <ProductIdentitySection
        identity={value.identity}
        onChange={patchIdentity}
        identityReadOnly={identityReadOnly}
        identitySourceLabel={identitySourceLabel}
      />
      <ProductAboutSection
        identity={value.identity}
        onChange={patchIdentity}
        identityReadOnly={identityReadOnly}
        identitySourceLabel={identitySourceLabel}
      />
      <ProductUserFieldsSection
        userFields={value.userFields}
        onChange={patchUserFields}
      />
      <ProductHowToUseSection
        guidance={value.guidance}
        onChange={patchGuidance}
      />
      <ProductManufacturerSection
        manufacturer={value.manufacturer}
        onChange={patchManufacturer}
      />
    </div>
  );
}
