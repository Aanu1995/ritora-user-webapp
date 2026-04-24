'use client';

import { useTranslations } from 'next-intl';
import type { LayeringStep } from '@/types/ingredients';

type Props = {
  steps: LayeringStep[];
};

export function LayeringOrderList({ steps }: Props) {
  const t = useTranslations('ingredients.layering');

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h4 className="text-sm font-semibold text-foreground">{t('heading')}</h4>
      <p className="mt-0.5 text-xs text-muted">{t('subheading')}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((step, index) => {
          const label =
            [step.brand, step.name].filter(Boolean).join(' · ') || step.productId;
          return (
            <li
              key={`${step.productId}-${index}`}
              className="flex items-start gap-2.5"
            >
              <span
                className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent-strong"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{step.reason}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
