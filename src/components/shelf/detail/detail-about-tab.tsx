'use client';

import { useTranslations } from 'next-intl';
import type { CatalogueIdentity } from '@/types/shelf';

type Props = {
  identity: CatalogueIdentity;
};

export function DetailAboutTab({ identity }: Props) {
  const t = useTranslations('shelf.detail.about');

  if (
    !identity.description &&
    identity.benefits.length === 0 &&
    identity.suitedFor.length === 0
  ) {
    return <p className="text-sm text-muted">{t('empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {identity.description ? (
        <p className="text-[15px] leading-relaxed">{identity.description}</p>
      ) : null}

      {identity.benefits.length > 0 ? (
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {t('benefits')}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {identity.benefits.map((benefit) => (
              <span
                key={benefit}
                className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {identity.suitedFor.length > 0 ? (
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {t('suitedFor')}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {identity.suitedFor.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-strong px-2.5 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
