'use client';

import { useTranslations } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ProductIntroductionStatus } from '@/types/shelf';
import { SectionLabel } from './product-form-fields';
import {
  PRODUCT_INTRODUCTION_START_OPTIONS,
  PRODUCT_INTRODUCTION_STATUS_META,
  PRODUCT_INTRODUCTION_TONE,
} from '../product-introduction-status-data';

type ProductIntroductionStartSectionProps = {
  value: ProductIntroductionStatus;
  onChange: (next: ProductIntroductionStatus) => void;
};

export function ProductIntroductionStartSection({
  value,
  onChange,
}: ProductIntroductionStartSectionProps) {
  const t = useTranslations('shelf.dialog.confirm');
  const tOptions = useTranslations(
    'shelf.dialog.confirm.introductionStatusOptions',
  );

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('sections.introduction')}</SectionLabel>
      <p className="-mt-2 text-xs text-muted">
        {t('hints.introductionDescription')}
      </p>

      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as ProductIntroductionStatus)}
        className="grid gap-3 md:grid-cols-2"
      >
        {PRODUCT_INTRODUCTION_START_OPTIONS.map((status) => {
          const meta = PRODUCT_INTRODUCTION_STATUS_META[status];
          const tone = PRODUCT_INTRODUCTION_TONE[meta.tone];
          const Icon = meta.icon;
          const selected = value === status;
          const itemId = `product-introduction-${status}`;

          return (
            <label
              key={status}
              htmlFor={itemId}
              className={cn(
                'flex cursor-pointer gap-3 rounded-2xl border bg-surface p-3.5 transition hover:border-accent/45 hover:bg-accent-soft/30',
                selected
                  ? 'border-accent/55 bg-accent-soft/45 shadow-sm'
                  : 'border-border',
              )}
            >
              <RadioGroupItem
                id={itemId}
                value={status}
                aria-label={tOptions(`${status}.title`)}
                className="mt-0.5"
              />
              <span className="flex min-w-0 flex-1 gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                    tone.tile,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {tOptions(`${status}.title`)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {tOptions(`${status}.description`)}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}
