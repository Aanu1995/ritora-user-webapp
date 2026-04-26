'use client';

import { ChevronDown, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SeverityBadge } from './severity-badge';
import { AnalysisSeverity, type IngredientConflict } from '@/types/ingredients';

type Props = {
  conflict: IngredientConflict;
};

export function ConflictCard({ conflict }: Props) {
  const t = useTranslations('ingredients.conflict');
  const [expanded, setExpanded] = useState(false);
  const body = conflict.explanation ?? conflict.description;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <TriangleAlert
            className={
              conflict.severity === AnalysisSeverity.High
                ? 'mt-0.5 h-4 w-4 flex-none text-danger'
                : conflict.severity === AnalysisSeverity.Medium
                  ? 'mt-0.5 h-4 w-4 flex-none text-warning'
                  : 'mt-0.5 h-4 w-4 flex-none text-muted'
            }
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {t('title', {
                ingredientA: conflict.ingredientA,
                ingredientB: conflict.ingredientB,
              })}
            </p>
            <p className="mt-0.5 text-xs text-muted">{conflict.code}</p>
          </div>
        </div>
        <SeverityBadge severity={conflict.severity} />
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
        <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
          <p>{body}</p>
          {conflict.mitigation ? (
            <p className="rounded-lg bg-surface-muted p-2 text-muted">
              <strong className="font-medium text-foreground">
                {t('mitigation')}:
              </strong>{' '}
              {conflict.mitigation}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
