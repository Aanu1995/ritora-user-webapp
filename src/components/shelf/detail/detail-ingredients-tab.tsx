'use client';

import { Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatLocalizedDate } from '@/lib/dayjs';

type Props = {
  ingredients: string[];
  lastConfirmedAt: string | null;
};

export function DetailIngredientsTab({ ingredients, lastConfirmedAt }: Props) {
  const t = useTranslations('shelf.detail.ingredients');
  const locale = useLocale();
  const confirmedDate = formatLocalizedDate(lastConfirmedAt, locale);

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{t('empty')}</p>
        <IntelligenceStub />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold">{t('heading')}</h3>
      <div className="rounded-xl bg-surface-muted p-4 text-[14px] leading-relaxed">
        {ingredients.join(', ')}
      </div>
      <IntelligenceStub />
      {confirmedDate ? (
        <p className="text-xs text-muted">
          {t('lastConfirmed', {
            date: confirmedDate,
          })}
        </p>
      ) : null}
    </div>
  );
}

function IntelligenceStub() {
  const t = useTranslations('shelf.detail.ingredients');
  return (
    <div className="mt-1 flex items-start gap-3 rounded-xl border border-dashed border-border-strong p-3">
      <Sparkles className="mt-0.5 h-4 w-4 flex-none text-accent-strong" />
      <div>
        <strong className="text-sm">{t('intelligenceStub')}</strong>
        <p className="mt-0.5 text-xs text-muted">{t('intelligenceBody')}</p>
      </div>
    </div>
  );
}
