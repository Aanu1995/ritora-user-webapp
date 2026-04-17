'use client';

import { useTranslations } from 'next-intl';
import { CountrySelect } from '@/components/ui/country-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PreferredTimeOfDay, type ManufacturerInfo, type UserFields } from '@/types/shelf';
import { Field, SectionLabel, TextAreaInput, TextInput } from './product-form-fields';

const PAO_OPTIONS = [6, 12, 18, 24, 36] as const;

type UserFieldsSectionProps = {
  userFields: UserFields;
  onChange: (patch: Partial<UserFields>) => void;
};

function addMonths(isoDate: string, months: number): string {
  const nextDate = new Date(isoDate);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate.toISOString().slice(0, 10);
}

export function ProductUserFieldsSection({
  userFields,
  onChange,
}: UserFieldsSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');

  const openedIso = (userFields.openedAt ?? '').slice(0, 10);
  const expiresIso = (userFields.expiresAt ?? '').slice(0, 10);
  const pao = userFields.periodAfterOpeningMonths;
  const derivedExpiresIso =
    !expiresIso && openedIso && pao ? addMonths(openedIso, pao) : expiresIso;

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.yours')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">{t('hints.yoursDescription')}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tField('openedAt')} hint={t('hints.openedAtHint')}>
          <DatePicker
            value={openedIso}
            onChange={(next) =>
              onChange({
                openedAt: next ? new Date(next).toISOString() : null,
                expiresAt: null,
              })
            }
            ariaLabel={tField('openedAt')}
            placeholder={tField('datePlaceholder')}
          />
        </Field>
        <Field label={tField('periodAfterOpening')} hint={t('hints.paoHint')}>
          <Select
            value={pao != null ? String(pao) : ''}
            onValueChange={(next) => {
              onChange({
                periodAfterOpeningMonths: next ? Number(next) : null,
                expiresAt: null,
              });
            }}
          >
            <SelectTrigger
              aria-label={tField('periodAfterOpening')}
              className="h-11"
            >
              <SelectValue placeholder={t('paoOptions.unknown')} />
            </SelectTrigger>
            <SelectContent>
              {PAO_OPTIONS.map((months) => (
                <SelectItem key={months} value={String(months)}>
                  {t(`paoOptions.${months}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={tField('expiresAt')} hint={t('hints.expiresAtHint')}>
          <DatePicker
            value={derivedExpiresIso}
            onChange={(next) =>
              onChange({
                expiresAt: next ? new Date(next).toISOString() : null,
              })
            }
            ariaLabel={tField('expiresAt')}
            placeholder={tField('datePlaceholder')}
          />
        </Field>
        <Field
          label={tField('preferredTimeOfDay')}
          hint={t('hints.preferredTimeHint')}
        >
          <Select
            value={userFields.preferredTimeOfDay ?? ''}
            onValueChange={(next) =>
              onChange({
                preferredTimeOfDay: (next as PreferredTimeOfDay | '') || null,
              })
            }
          >
            <SelectTrigger
              aria-label={tField('preferredTimeOfDay')}
              className="h-11"
            >
              <SelectValue placeholder={t('preferredTimeOptions.none')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PreferredTimeOfDay.Morning}>
                {t('preferredTimeOptions.morning')}
              </SelectItem>
              <SelectItem value={PreferredTimeOfDay.Evening}>
                {t('preferredTimeOptions.evening')}
              </SelectItem>
              <SelectItem value={PreferredTimeOfDay.Either}>
                {t('preferredTimeOptions.either')}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={tField('pricePaid')} hint={t('hints.priceHint')}>
          <TextInput
            type="text"
            value={
              userFields.pricePaid != null ? String(userFields.pricePaid) : ''
            }
            onChange={(raw) =>
              onChange({ pricePaid: raw === '' ? null : Number(raw) })
            }
            placeholder={tField('pricePlaceholder')}
            aria-label={tField('pricePaid')}
          />
        </Field>
        <Field
          label={tField('purchasedFrom')}
          hint={t('hints.purchasedFromHint')}
        >
          <TextInput
            value={userFields.purchasedFrom ?? ''}
            onChange={(purchasedFrom) =>
              onChange({ purchasedFrom: purchasedFrom || null })
            }
            placeholder={tField('purchasedFromPlaceholder')}
            aria-label={tField('purchasedFrom')}
          />
        </Field>
        <Field
          label={tField('personalNotes')}
          hint={t('hints.personalNotesHint')}
          fullWidth
        >
          <TextAreaInput
            rows={2}
            value={userFields.personalNotes ?? ''}
            onChange={(personalNotes) =>
              onChange({ personalNotes: personalNotes || null })
            }
            placeholder={tField('notesPlaceholder')}
            aria-label={tField('personalNotes')}
            className="min-h-[72px]"
          />
        </Field>
      </div>
    </section>
  );
}

type ManufacturerSectionProps = {
  manufacturer: ManufacturerInfo;
  onChange: (patch: Partial<ManufacturerInfo>) => void;
};

export function ProductManufacturerSection({
  manufacturer,
  onChange,
}: ManufacturerSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tField = useTranslations('shelf.dialog.confirm.fields');
  const tManufacturer = useTranslations('shelf.detail.manufacturer');

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{tManufacturer('heading')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">
        {t('hints.manufacturerDescription')}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tManufacturer('parent')} hint={t('hints.parentCompanyHint')}>
          <TextInput
            value={manufacturer.parentCompany ?? ''}
            onChange={(parentCompany) =>
              onChange({ parentCompany: parentCompany || null })
            }
            aria-label={tManufacturer('parent')}
          />
        </Field>
        <Field label={tManufacturer('madeIn')} hint={t('hints.countryManufactureHint')}>
          <CountrySelect
            value={manufacturer.countryOfManufacture}
            onChange={(countryOfManufacture) =>
              onChange({ countryOfManufacture })
            }
            ariaLabel={tManufacturer('madeIn')}
          />
        </Field>
        <Field label={tManufacturer('support')} hint={t('hints.supportEmailHint')}>
          <TextInput
            type="email"
            value={manufacturer.supportEmail ?? ''}
            onChange={(supportEmail) =>
              onChange({ supportEmail: supportEmail || null })
            }
            aria-label={tManufacturer('support')}
          />
        </Field>
        <Field label={tField('productUrl')} hint={t('hints.productUrlHint')}>
          <TextInput
            value={manufacturer.productUrl ?? ''}
            onChange={(productUrl) => onChange({ productUrl: productUrl || null })}
            placeholder={tField('productUrlPlaceholder')}
            aria-label={tField('productUrl')}
          />
        </Field>
      </div>
    </section>
  );
}
