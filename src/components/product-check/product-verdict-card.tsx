'use client';

import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ProductCheckTone,
  type ProductCheckReason,
  type ProductCheckVerdictResult,
} from '@/types/ingredients';

type Props = {
  verdict: ProductCheckVerdictResult;
};

const TONE_CLASS: Record<ProductCheckTone, string> = {
  [ProductCheckTone.Positive]: 'border-accent/20 bg-accent-soft',
  [ProductCheckTone.Caution]: 'border-warning/30 bg-warning-soft',
  [ProductCheckTone.Danger]: 'border-danger/30 bg-danger-soft',
  [ProductCheckTone.Neutral]: 'border-border bg-surface',
};

const TONE_ICON_CLASS: Record<ProductCheckTone, string> = {
  [ProductCheckTone.Positive]: 'bg-surface text-accent-strong',
  [ProductCheckTone.Caution]: 'bg-surface text-warning',
  [ProductCheckTone.Danger]: 'bg-surface text-danger',
  [ProductCheckTone.Neutral]: 'bg-surface-muted text-muted',
};

const TONE_ICON = {
  [ProductCheckTone.Positive]: CheckCircle2,
  [ProductCheckTone.Caution]: AlertTriangle,
  [ProductCheckTone.Danger]: ShieldAlert,
  [ProductCheckTone.Neutral]: HelpCircle,
};

export function ProductVerdictCard({ verdict }: Props) {
  const t = useTranslations('checkProduct.result');
  const Icon = TONE_ICON[verdict.tone];

  return (
    <section
      className={`animate-slide-up rounded-2xl border p-4 shadow-[var(--shadow-soft)] sm:p-5 ${TONE_CLASS[verdict.tone]}`}
    >
      <header className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_ICON_CLASS[verdict.tone]}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {t('eyebrow')}
          </p>
          <h2 className="mt-0.5 font-display text-sm font-bold -tracking-[0.01em] text-foreground sm:text-[15px]">
            {t(`labels.${verdict.label}`)}
          </h2>
          <p className="mt-1 text-xs leading-snug text-muted sm:text-[13px]">
            {t(`nextActions.${verdict.nextAction}`)}
          </p>
        </div>
      </header>

      <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/50 pt-3">
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {t('scoreLabel')}
          </dt>
          <dd className="font-display text-base font-bold tabular-nums text-foreground">
            {verdict.safetyScore === null
              ? t('scoreUnknown')
              : verdict.safetyScore}
          </dd>
        </div>
        <span className="text-[11px] text-muted" aria-hidden>
          ·
        </span>
        <dd className="text-[11px] text-muted">
          {t(`confidence.${verdict.confidence}`)}
        </dd>
      </dl>

      {verdict.reasons.length > 0 ? (
        <ProductCheckReasons reasons={verdict.reasons} />
      ) : (
        <p className="mt-3 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted sm:text-[13px]">
          {t('noReasons')}
        </p>
      )}
    </section>
  );
}

function ProductCheckReasons({ reasons }: { reasons: ProductCheckReason[] }) {
  const t = useTranslations('checkProduct.result');

  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {reasons.map((reason, index) => (
        <li
          key={`${reason.code}:${reason.conflictCode ?? reason.ingredientNames.join(',')}:${index}`}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-snug text-foreground sm:text-[13px]"
        >
          <span>{t(`reasons.${reason.code}`)}</span>
          {reason.ingredientNames.length > 0 ? (
            <span className="text-muted">
              {' '}
              {t('reasonIngredients', {
                ingredients: reason.ingredientNames.join(', '),
              })}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
