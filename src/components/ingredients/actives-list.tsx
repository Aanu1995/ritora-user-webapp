import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AnalysisActive } from '@/types/ingredients';

type Props = {
  actives: AnalysisActive[];
};

/**
 * Educational list of the product's matched active ingredients. Each row
 * shows a category badge, the ingredient name, and a short blurb of what
 * it does. Localisation happens server-side — the `summary` string here
 * is already in the requested language.
 */
export function ActivesList({ actives }: Props) {
  const t = useTranslations('ingredients.actives');
  const tCategory = useTranslations('ingredients.category');

  if (actives.length === 0) {
    return (
      <section aria-label={t('heading')} className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">{t('heading')}</h3>
        <p className="rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-muted">
          {t('empty')}
        </p>
      </section>
    );
  }

  return (
    <section aria-label={t('heading')} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent-strong" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{t('heading')}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {actives.map((active) => (
          <li
            key={active.slug}
            className="rounded-2xl border border-border bg-surface p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {active.displayName}
              </p>
              <span className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-strong">
                {tCategory(active.category)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {active.summary}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
