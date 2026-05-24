'use client';

import { LoaderCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ActivesList } from './actives-list';
import { InsufficientDataState } from './insufficient-data-state';
import { IntelligencePanelSkeleton } from './intelligence-panel.skeleton';
import { Button } from '@/components/ui/button';
import { RetryPanel } from '@/components/ui/retry-panel';
import {
  useFocusProductAnalysis,
  useRetryFocusProductAnalysis,
} from '@/hooks/use-ingredients';
import { AnalysisStatus } from '@/types/ingredients';

type Props = {
  productId: string;
  hasIngredientList?: boolean;
};

/**
 * Educational panel rendered on the Shelf product-detail Ingredients tab.
 *
 * Shows ONLY information about THIS product:
 *   - Key actives (localised blurbs)
 *   - Pairing guidance (what to avoid combining in the same routine)
 *
 * It deliberately does NOT compare against other shelf products — the
 * shelf isn't a routine and that comparison produces false positives.
 * Routine-scoped conflict analysis will live inside Today's Suggestion
 * when that ships.
 */
export function IntelligencePanel({
  productId,
  hasIngredientList = false,
}: Props) {
  const t = useTranslations('ingredients.panel');
  const tActives = useTranslations('ingredients.actives');
  const query = useFocusProductAnalysis(productId, {
    withExplanations: false,
  });
  const retryAnalysis = useRetryFocusProductAnalysis(productId, {
    withExplanations: false,
  });

  if (query.isPending) {
    return <IntelligencePanelSkeleton />;
  }

  if (query.isError) {
    return (
      <RetryPanel
        title={t('errorTitle')}
        description={t('errorBody')}
        actionLabel={t('retry')}
        onAction={() => {
          void query.refetch();
        }}
      />
    );
  }

  const result = query.data;
  const isAnalyzing = query.isFetching || retryAnalysis.isPending;
  const analyzeAgainAction = hasIngredientList ? (
    isAnalyzing ? (
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <LoaderCircle
          className="h-3.5 w-3.5 animate-spin"
          aria-hidden="true"
        />
        <span>{t('analyzingAgain')}</span>
      </div>
    ) : (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => {
          retryAnalysis.mutate();
        }}
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        {t('analyzeAgain')}
      </Button>
    )
  ) : null;

  if (result.status === AnalysisStatus.InsufficientData) {
    if (hasIngredientList) {
      return (
        <section
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-border-strong p-4"
          data-testid="analysis-empty-result-state"
        >
          <div className="flex items-start gap-3">
            <RefreshCw
              className="mt-0.5 h-4 w-4 flex-none text-accent-strong"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t('emptyResultTitle')}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                {t('emptyResultBody')}
              </p>
            </div>
          </div>
          {analyzeAgainAction}
        </section>
      );
    }

    return (
      <InsufficientDataState productsMissingInci={result.productsMissingInci} />
    );
  }

  return (
    <section className="flex flex-col gap-3" data-testid="intelligence-panel">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck
            className="h-4 w-4 text-accent-strong"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-foreground">
            {t('heading')}
          </h3>
        </div>
        <span aria-hidden="true" className="text-xs text-muted">
          ·
        </span>
        <div className="inline-flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 text-accent-strong"
            aria-hidden="true"
          />
          <h4 className="text-sm font-semibold text-foreground">
            {tActives('heading')}
          </h4>
        </div>
      </header>
      <ActivesList
        actives={result.actives}
        emptyAction={analyzeAgainAction}
        hideHeading
      />
    </section>
  );
}
