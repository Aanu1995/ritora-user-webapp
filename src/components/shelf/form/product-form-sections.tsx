'use client';

import { useTranslations } from 'next-intl';
import type { ProductFormGuidanceErrors } from '../product-form-body';
import { ProductIllustration } from '../product-illustration';
import { HowToUseEditor } from '../how-to-use-editor';
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
};

function createSourceBadge(identitySourceLabel?: string) {
  return identitySourceLabel ? (
    <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-soft-foreground">
      {identitySourceLabel}
    </span>
  ) : null;
}

type IdentitySectionProps = BaseSectionProps & {
  identity: CatalogueIdentity;
  onChange: (patch: Partial<CatalogueIdentity>) => void;
};

export function ProductIdentitySection({
  identity,
  onChange,
  identityReadOnly,
  identitySourceLabel,
  fieldErrors,
}: IdentitySectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');
  const tCategory = useTranslations('shelf.category');
  const sourceBadge = createSourceBadge(identitySourceLabel);

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.identity')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.identityDescription')}</p>

      <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:gap-6">
        <div className="mx-auto w-full max-w-[160px] sm:mx-0 sm:max-w-none">
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
            <ProductIllustration
              brand={identity.brand}
              category={identity.category}
              className="h-[60%] w-auto"
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-muted sm:text-left">
            {t('hints.photoUploadComingSoon')}
          </p>
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
            badge={identityReadOnly ? sourceBadge : null}
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
}: AboutSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');
  const sourceBadge = createSourceBadge(identitySourceLabel);

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.about')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.aboutDescription')}</p>

      <div className="flex flex-col gap-3">
        <Field
          label={tField('description')}
          hint={t('hints.descriptionHint')}
          badge={identityReadOnly && identity.description ? sourceBadge : null}
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
            identityReadOnly && identity.inciIngredients.length > 0
              ? sourceBadge
              : null
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
};

export function ProductHowToUseSection({
  guidance,
  onChange,
  errors,
}: HowToUseSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.guidance')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.guidanceDescription')}</p>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <HowToUseEditor value={guidance} onChange={onChange} errors={errors} />
      </div>
    </section>
  );
}
