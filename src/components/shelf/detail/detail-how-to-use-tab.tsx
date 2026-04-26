'use client';

import { AlertTriangle, Clock, Hand } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  type ApplicationGuidance,
  type PreferredTimeOfDay,
} from '@/types/shelf';

type Props = {
  guidance: ApplicationGuidance;
  preferredTimeOfDay: PreferredTimeOfDay | null;
};

export function DetailHowToUseTab({ guidance, preferredTimeOfDay }: Props) {
  const t = useTranslations('shelf.detail.howToUse');
  const tMethod = useTranslations('shelf.method');
  const tQty = useTranslations('shelf.quantity');
  const tPreferred = useTranslations('shelf.preferredTime');

  const isEmpty =
    !guidance.applicationMethod &&
    !guidance.quantity &&
    guidance.steps.length === 0 &&
    guidance.cautions.length === 0;

  if (isEmpty) {
    return <p className="text-sm text-muted">{t('empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-lg font-semibold">{t('heading')}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
          {guidance.applicationMethod ? (
            <span className="inline-flex items-center gap-1.5">
              <Hand className="h-3.5 w-3.5" />
              <strong className="font-semibold text-foreground">
                {t('method')}:
              </strong>{' '}
              {tMethod(guidance.applicationMethod)}
            </span>
          ) : null}
          {guidance.quantity ? (
            <span className="inline-flex items-center gap-1.5">
              <strong className="font-semibold text-foreground">
                {t('quantity')}:
              </strong>{' '}
              {tQty(guidance.quantity)}
            </span>
          ) : null}
          {guidance.waitMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {guidance.waitMinutes === 1
                ? t('waitMinute', { minutes: guidance.waitMinutes })
                : t('waitMinutes', { minutes: guidance.waitMinutes })}
            </span>
          ) : null}
        </div>
      </div>

      {guidance.steps.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {guidance.steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-xl bg-surface-muted p-3"
            >
              <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-strong text-[11px] font-bold text-surface">
                {index + 1}
              </span>
              <span className="text-[14px] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {guidance.cautions.length > 0 ? (
        <div>
          <h4 className="mb-2 font-display text-base font-semibold">
            {t('cautions')}
          </h4>
          <ul className="flex flex-col gap-2">
            {guidance.cautions.map((caution, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-xl bg-warning/10 p-3 text-sm text-warning"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{caution}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-muted">{t('routineNote')}</p>

      {preferredTimeOfDay ? (
        <p className="text-xs text-muted">
          {t('preferredNote', { time: tPreferred(preferredTimeOfDay) })}
        </p>
      ) : null}
    </div>
  );
}
