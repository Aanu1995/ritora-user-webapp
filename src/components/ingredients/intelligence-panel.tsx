'use client';

import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ActivesList } from './actives-list';
import { InsufficientDataState } from './insufficient-data-state';
import { IntelligencePanelSkeleton } from './intelligence-panel.skeleton';
import { PairingGuidance } from './pairing-guidance';
import { RetryPanel } from '@/components/ui/retry-panel';
import { useFocusProductAnalysis } from '@/hooks/use-ingredients';
import { AnalysisStatus } from '@/types/ingredients';

type Props = {
  productId: string;
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
export function IntelligencePanel({ productId }: Props) {
  const t = useTranslations('ingredients.panel');
  const query = useFocusProductAnalysis(productId, {
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

  if (result.status === AnalysisStatus.InsufficientData) {
    return (
      <InsufficientDataState productsMissingInci={result.productsMissingInci} />
    );
  }

  return (
    <section className="flex flex-col gap-4" data-testid="intelligence-panel">
      <header className="flex items-center gap-2">
        <ShieldCheck
          className="h-4 w-4 text-accent-strong"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-foreground">{t('heading')}</h3>
      </header>
      <ActivesList actives={result.actives} />
      <PairingGuidance actives={result.actives} />
    </section>
  );
}
