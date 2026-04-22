'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  ProductFormGuidanceErrors,
  ProductFormReviewFields,
} from '../product-form-body';
import { ProductIllustration } from '../product-illustration';
import { HowToUseEditor } from '../how-to-use-editor';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type ApplicationGuidance,
  type CatalogueIdentity,
  ProductCategory,
} from '@/types/shelf';
import type { ShelfFormFieldErrors } from '@/lib/shelf-form';
import {
  Field,
  ListTextAreaInput,
  ListTextInput,
  SectionLabel,
  TextAreaInput,
  TextInput,
} from './product-form-fields';

const CATEGORY_OPTIONS = Object.values(ProductCategory);

type BaseSectionProps = {
  identityReadOnly: boolean;
  identitySourceLabel?: string;
  fieldErrors?: ShelfFormFieldErrors;
  reviewFields?: ProductFormReviewFields;
};

function createSourceBadge(identitySourceLabel?: string) {
  return identitySourceLabel ? (
    <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-soft-foreground">
      {identitySourceLabel}
    </span>
  ) : null;
}

function createReviewBadge(
  shouldReview: boolean | undefined,
  label: string,
) {
  return shouldReview ? (
    <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
      {label}
    </span>
  ) : null;
}

type ProductIdentityPhotoUploadText = {
  chooseLabel: string;
  replaceLabel: string;
  chooseDifferentLabel: string;
  uploadLabel: string;
  uploadingLabel: string;
  clearLabel: string;
  inputLabel: string;
  helperText: string;
  emptyHint: string;
  selectedHint: string;
  uploadedHint: string;
};

export type ProductIdentityPhotoUploadProps = {
  previewUrl: string | null;
  isPendingSelection: boolean;
  isUploading: boolean;
  onSelectFile: (file: File | null) => void;
  onUpload: () => void;
  onClearSelection: () => void;
  text: ProductIdentityPhotoUploadText;
};

type IdentitySectionProps = BaseSectionProps & {
  identity: CatalogueIdentity;
  onChange: (patch: Partial<CatalogueIdentity>) => void;
  photoUpload?: ProductIdentityPhotoUploadProps;
};

export function ProductIdentitySection({
  identity,
  onChange,
  identityReadOnly,
  identitySourceLabel,
  fieldErrors,
  reviewFields,
  photoUpload,
}: IdentitySectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');
  const tCategory = useTranslations('shelf.category');
  const reviewBadgeLabel = t('needsReviewBadge');
  const sourceBadge = createSourceBadge(identitySourceLabel);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUrl = photoUpload?.previewUrl ?? identity.imageUrls[0] ?? null;

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.identity')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.identityDescription')}</p>

      <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[minmax(0,10rem)_1fr] sm:items-start sm:gap-6">
        <div className="mx-auto w-full max-w-40 sm:mx-0">
          {photoUpload ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label={photoUpload.text.inputLabel}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  photoUpload.onSelectFile(file);
                  event.target.value = '';
                }}
              />

              {imageUrl ? (
                <div
                  className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 bg-background ${
                    photoUpload.isPendingSelection
                      ? 'border-accent-strong'
                      : 'border-border'
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${identity.brand} ${identity.name}`.trim() || tField('name')}
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUpload.isUploading}
                  className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-muted/40 px-4 text-center text-muted transition hover:border-border-strong hover:bg-surface-muted/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm font-medium text-foreground">
                    {photoUpload.text.chooseLabel}
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${identity.brand} ${identity.name}`.trim() || tField('name')}
                  width={320}
                  height={320}
                  unoptimized
                  sizes="160px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProductIllustration
                  brand={identity.brand}
                  category={identity.category}
                  className="h-[60%] w-auto"
                />
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={tField('brand')}
            badge={identityReadOnly ? sourceBadge : null}
            error={fieldErrors?.['identity.brand']}
          >
            <TextInput
              value={identity.brand}
              readOnly={identityReadOnly}
              onChange={(brand) => onChange({ brand })}
              placeholder={tField('brandPlaceholder')}
              aria-label={tField('brand')}
              invalid={Boolean(fieldErrors?.['identity.brand'])}
            />
          </Field>
          <Field
            label={tField('name')}
            badge={identityReadOnly ? sourceBadge : null}
            error={fieldErrors?.['identity.name']}
          >
            <TextInput
              value={identity.name}
              readOnly={identityReadOnly}
              onChange={(name) => onChange({ name })}
              placeholder={tField('namePlaceholder')}
              aria-label={tField('name')}
              invalid={Boolean(fieldErrors?.['identity.name'])}
            />
          </Field>
          <Field
            label={tField('category')}
            badge={identityReadOnly ? sourceBadge : null}
          >
            <Select
              value={identity.category}
              onValueChange={(next) => onChange({ category: next as ProductCategory })}
              disabled={identityReadOnly}
            >
              <SelectTrigger
                aria-label={tField('category')}
                className="h-11"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {tCategory(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={tField('size')}
            hint={t('hints.sizeHint')}
            badge={
              createReviewBadge(reviewFields?.['identity.sizeMl'], reviewBadgeLabel) ??
              (identityReadOnly ? sourceBadge : null)
            }
            error={fieldErrors?.['identity.sizeMl']}
          >
            <TextInput
              type="number"
              value={identity.sizeMl != null ? String(identity.sizeMl) : ''}
              onChange={(raw) =>
                onChange({ sizeMl: raw === '' ? null : Number(raw) })
              }
              placeholder={tField('sizePlaceholder')}
              readOnly={identityReadOnly}
              aria-label={tField('size')}
              invalid={Boolean(fieldErrors?.['identity.sizeMl'])}
            />
          </Field>
        </div>
      </div>

      {photoUpload && (photoUpload.isPendingSelection || imageUrl) ? (
        <div className="flex flex-wrap gap-2">
          {photoUpload.isPendingSelection ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={photoUpload.onUpload}
                disabled={photoUpload.isUploading}
              >
                {photoUpload.isUploading
                  ? photoUpload.text.uploadingLabel
                  : photoUpload.text.uploadLabel}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUpload.isUploading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {photoUpload.text.chooseDifferentLabel}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={photoUpload.onClearSelection}
                disabled={photoUpload.isUploading}
                className="text-danger hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {photoUpload.text.clearLabel}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUpload.isUploading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {photoUpload.text.replaceLabel}
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}

type AboutSectionProps = BaseSectionProps & {
  identity: CatalogueIdentity;
  onChange: (patch: Partial<CatalogueIdentity>) => void;
};

export function ProductAboutSection({
  identity,
  onChange,
  identityReadOnly,
  identitySourceLabel,
  fieldErrors,
  reviewFields,
}: AboutSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');
  const reviewBadgeLabel = t('needsReviewBadge');
  const sourceBadge = createSourceBadge(identitySourceLabel);

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.about')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.aboutDescription')}</p>

      <div className="flex flex-col gap-3">
        <Field
          label={tField('description')}
          hint={t('hints.descriptionHint')}
          badge={
            createReviewBadge(
              reviewFields?.['identity.description'],
              reviewBadgeLabel,
            ) ??
            (identityReadOnly && identity.description ? sourceBadge : null)
          }
          error={fieldErrors?.['identity.description']}
        >
          <TextAreaInput
            rows={3}
            value={identity.description ?? ''}
            onChange={(description) =>
              onChange({ description: description || null })
            }
            readOnly={identityReadOnly}
            placeholder={tField('descriptionPlaceholder')}
            aria-label={tField('description')}
            className="min-h-[88px]"
            invalid={Boolean(fieldErrors?.['identity.description'])}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={tField('benefits')}
            hint={t('hints.benefitsHint')}
            badge={createReviewBadge(
              reviewFields?.['identity.benefits'],
              reviewBadgeLabel,
            )}
            error={fieldErrors?.['identity.benefits']}
          >
            <ListTextInput
              value={identity.benefits}
              onChange={(benefits) => onChange({ benefits })}
              placeholder={tField('benefitsPlaceholder')}
              aria-label={tField('benefits')}
              disabled={identityReadOnly}
              invalid={Boolean(fieldErrors?.['identity.benefits'])}
            />
          </Field>
          <Field
            label={tField('suitedFor')}
            hint={t('hints.suitedForHint')}
            badge={createReviewBadge(
              reviewFields?.['identity.suitedFor'],
              reviewBadgeLabel,
            )}
            error={fieldErrors?.['identity.suitedFor']}
          >
            <ListTextInput
              value={identity.suitedFor}
              onChange={(suitedFor) => onChange({ suitedFor })}
              placeholder={tField('suitedForPlaceholder')}
              aria-label={tField('suitedFor')}
              disabled={identityReadOnly}
              invalid={Boolean(fieldErrors?.['identity.suitedFor'])}
            />
          </Field>
        </div>

        <Field
          label={tField('inciIngredients')}
          hint={t('hints.ingredientsHint')}
          badge={
            createReviewBadge(
              reviewFields?.['identity.inciIngredients'],
              reviewBadgeLabel,
            ) ??
            (identityReadOnly && identity.inciIngredients.length > 0
              ? sourceBadge
              : null)
          }
          error={fieldErrors?.['identity.inciIngredients']}
        >
          <ListTextAreaInput
            rows={4}
            value={identity.inciIngredients}
            onChange={(inciIngredients) => onChange({ inciIngredients })}
            readOnly={identityReadOnly}
            placeholder={tField('ingredientsPlaceholder')}
            aria-label={tField('inciIngredients')}
            className="min-h-[110px]"
            invalid={Boolean(fieldErrors?.['identity.inciIngredients'])}
          />
        </Field>
      </div>
    </section>
  );
}

type HowToUseSectionProps = {
  guidance: ApplicationGuidance;
  onChange: (next: ApplicationGuidance) => void;
  errors?: ProductFormGuidanceErrors;
  reviewFields?: ProductFormReviewFields;
};

export function ProductHowToUseSection({
  guidance,
  onChange,
  errors,
  reviewFields,
}: HowToUseSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const reviewBadgeLabel = t('needsReviewBadge');

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SectionLabel>{t('sections.guidance')}</SectionLabel>
        {createReviewBadge(reviewFields?.guidance, reviewBadgeLabel)}
      </div>
      <p className="-mt-2 text-xs text-muted">{t('hints.guidanceDescription')}</p>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <HowToUseEditor value={guidance} onChange={onChange} errors={errors} />
      </div>
    </section>
  );
}
