'use client';

import { useTranslations } from 'next-intl';
import type {
  ProductFormGuidanceErrors,
  ProductFormReviewFields,
} from '../product-form-body';
import { HowToUseEditor } from '../how-to-use-editor';
import {
  type ApplicationGuidance,
  type CatalogueIdentity,
} from '@/types/shelf';
import type { ShelfFormFieldErrors } from '@/lib/shelf-form';
import { createReviewBadge, createSourceBadge } from './product-form-badges';
import {
  Field,
  ListTextAreaInput,
  ListTextInput,
  SectionLabel,
  TextAreaInput,
} from './product-form-fields';

export {
  ProductIdentitySection,
  type ProductIdentityPhotoUploadProps,
} from './product-identity-section';

type BaseSectionProps = {
  identityReadOnly: boolean;
  identitySourceLabel?: string;
  fieldErrors?: ShelfFormFieldErrors;
  reviewFields?: ProductFormReviewFields;
};

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
            ) ?? (identityReadOnly && identity.description ? sourceBadge : null)
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
        >
          <ListTextAreaInput
            rows={4}
            value={identity.inciIngredients}
            onChange={(inciIngredients) => onChange({ inciIngredients })}
            readOnly={identityReadOnly}
            placeholder={tField('ingredientsPlaceholder')}
            aria-label={tField('inciIngredients')}
            className="min-h-[110px]"
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
      <p className="-mt-2 text-xs text-muted">
        {t('hints.guidanceDescription')}
      </p>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <HowToUseEditor value={guidance} onChange={onChange} errors={errors} />
      </div>
    </section>
  );
}
