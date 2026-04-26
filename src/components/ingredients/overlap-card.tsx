'use client';

import { ChevronDown, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SeverityBadge } from './severity-badge';
import type { IngredientOverlap } from '@/types/ingredients';

type Props = {
  overlap: IngredientOverlap;
};

export function OverlapCard({ overlap }: Props) {
  const t = useTranslations('ingredients.overlap');
  const [expanded, setExpanded] = useState(false);
  const body = overlap.explanation ?? overlap.description;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Layers
            className="mt-0.5 h-4 w-4 flex-none text-accent-strong"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {t('title', { ingredient: overlap.ingredient })}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {t(
                overlap.productIds.length === 1
                  ? 'productCountSingle'
                  : 'productCountPlural',
                { count: overlap.productIds.length },
              )}
            </p>
          </div>
        </div>
        <SeverityBadge severity={overlap.severity} />
      </header>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-strong"
        aria-expanded={expanded}
      >
        {expanded ? t('hideWhy') : t('showWhy')}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <p className="mt-2 text-xs leading-relaxed text-foreground">{body}</p>
      ) : null}
    </article>
  );
}
