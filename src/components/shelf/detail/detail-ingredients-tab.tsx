'use client';

import { useLocale, useTranslations } from 'next-intl';
import { InsufficientDataState } from '@/components/ingredients/insufficient-data-state';
import { IntelligencePanel } from '@/components/ingredients/intelligence-panel';
import { formatLocalizedDate } from '@/lib/dayjs';

type Props = {
  productId: string;
  ingredients: string[];
  lastConfirmedAt: string | null;
};

export function DetailIngredientsTab({
  productId,
  ingredients,
  lastConfirmedAt,
}: Props) {
  const t = useTranslations('shelf.detail.ingredients');
  const locale = useLocale();
  const confirmedDate = formatLocalizedDate(lastConfirmedAt, locale);

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{t('empty')}</p>
        <InsufficientDataState
          productsMissingInci={[productId]}
          compact
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold">{t('heading')}</h3>
        <div className="rounded-xl bg-surface-muted p-4 text-[14px] leading-relaxed">
          {ingredients.join(', ')}
        </div>
        {confirmedDate ? (
          <p className="text-xs text-muted">
            {t('lastConfirmed', {
              date: confirmedDate,
            })}
          </p>
        ) : null}
      </div>
      <IntelligencePanel productId={productId} />
    </div>
  );
}
