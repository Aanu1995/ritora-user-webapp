import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AnalysisActive } from '@/types/ingredients';

type Props = {
  actives: AnalysisActive[];
};

/**
 * Per-active pairing guidance. For each matched active, lists the
 * categories and ingredients it should not be paired with in the same
 * routine. Silent when an active has no avoid-targets.
 */
export function PairingGuidance({ actives }: Props) {
  const t = useTranslations('ingredients.pairing');
  const tCategory = useTranslations('ingredients.category');

  const actionable = actives.filter(
    (active) =>
      active.avoidCategories.length > 0 || active.avoidIngredientSlugs.length > 0,
  );

  if (actionable.length === 0) {
    return null;
  }

  return (
    <section aria-label={t('heading')} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-accent-strong" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{t('heading')}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {actionable.map((active) => (
          <li
            key={active.slug}
            className="rounded-2xl border border-border bg-surface p-3"
          >
            <p className="text-sm font-semibold text-foreground">
              {active.displayName}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t('avoidWith')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {active.avoidCategories.map((cat) => (
                <span
                  key={`cat-${cat}`}
                  className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {tCategory(cat)}
                </span>
              ))}
              {active.avoidIngredientSlugs.map((slug) => (
                <span
                  key={`slug-${slug}`}
                  className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {slug}
                </span>
              ))}
            </div>
            {active.mitigationHint ? (
              <p className="mt-2 rounded-lg bg-accent-soft/60 p-2 text-[11px] leading-relaxed text-accent-strong">
                {t('mitigationHint', { hint: active.mitigationHint })}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
