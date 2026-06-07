import type { ReactNode } from 'react';
import { Sparkles, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AnalysisActive } from '@/types/ingredients';

type Props = {
  actives: AnalysisActive[];
  emptyAction?: ReactNode;
  /**
   * When true, ActivesList does not render its own "Key actives" heading.
   * Used by `IntelligencePanel` so the parent can render a single combined
   * header row (e.g. "Ingredient intelligence · Key actives") instead of
   * stacking two h3s on top of each other.
   */
  hideHeading?: boolean;
};

/**
 * Per-active intelligence cards. Each row shows one active ingredient with:
 *   - Display name + category badge
 *   - Short educational blurb (what it does)
 *   - When applicable, an inline pairing block (categories and ingredients
 *     to avoid combining with in the same routine, plus an optional safer
 *     plan tip).
 *
 * This component used to be paired with a separate `PairingGuidance` list
 * that duplicated each active's name and forced a second scroll. Pairing
 * concerns now live inside the active they belong to so users see "what
 * is it" and "how to use it safely" in the same glance.
 */
export function ActivesList({ actives, emptyAction, hideHeading = false }: Props) {
  const t = useTranslations('ingredients.actives');
  const tPairing = useTranslations('ingredients.pairing');
  const tCategory = useTranslations('ingredients.category');

  if (actives.length === 0) {
    return (
      <section aria-label={t('heading')} className="flex flex-col gap-2">
        {hideHeading ? null : (
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-4 w-4 text-accent-strong"
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-foreground">
              {t('heading')}
            </h3>
          </div>
        )}
        <p className="rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-muted">
          {t('empty')}
        </p>
        {emptyAction}
      </section>
    );
  }

  return (
    <section aria-label={t('heading')} className="flex flex-col gap-2.5">
      {hideHeading ? null : (
        <div className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 text-accent-strong"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-foreground">
            {t('heading')}
          </h3>
        </div>
      )}
      <ul className="flex flex-col gap-2.5">
        {actives.map((active) => {
          const hasAvoidTargets =
            active.avoidCategories.length > 0 ||
            active.avoidIngredients.length > 0;

          return (
            <li
              key={active.slug}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {active.displayName}
                  </p>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-strong">
                    {tCategory(active.category)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {active.summary}
                </p>
              </div>

              {hasAvoidTargets ? (
                <div className="border-t border-[color:rgba(184,84,10,0.18)] bg-[color:var(--warning-soft)] px-3.5 py-3">
                  <div className="flex items-start gap-2">
                    <TriangleAlert
                      className="mt-0.5 h-3.5 w-3.5 flex-none text-[color:var(--warning)]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--warning)]">
                        {tPairing('avoidLabel')}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {active.avoidCategories.map((cat) => (
                          <span
                            key={`cat-${cat}`}
                            className="inline-flex items-center rounded-full border border-[color:rgba(184,84,10,0.32)] bg-surface px-2 py-0.5 text-[11px] font-medium text-[color:var(--note-warm-fg)]"
                          >
                            {tCategory(cat)}
                          </span>
                        ))}
                        {active.avoidIngredients.map((ingredient) => (
                          <span
                            key={`ingredient-${ingredient.slug}`}
                            className="inline-flex items-center rounded-full border border-[color:rgba(184,84,10,0.32)] bg-surface px-2 py-0.5 text-[11px] font-medium text-[color:var(--note-warm-fg)]"
                          >
                            {ingredient.displayName}
                          </span>
                        ))}
                      </div>
                      {active.mitigationHint ? (
                        <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--note-warm-fg)]">
                          <span className="font-semibold">
                            {tPairing('saferPlanLabel')}:{' '}
                          </span>
                          {active.mitigationHint}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
