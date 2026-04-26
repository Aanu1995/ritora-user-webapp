'use client';

import { useId } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ApplicationMethod,
  type ApplicationGuidance,
  Quantity,
} from '@/types/shelf';

type Props = {
  value: ApplicationGuidance;
  onChange: (next: ApplicationGuidance) => void;
  errors?: {
    steps?: string;
    cautions?: string;
  };
};

const METHOD_OPTIONS = Object.values(ApplicationMethod);
const QUANTITY_OPTIONS = Object.values(Quantity);

export function HowToUseEditor({ value, onChange, errors }: Props) {
  const t = useTranslations('shelf.detail.howToUse');
  const tMethod = useTranslations('shelf.method');
  const tQty = useTranslations('shelf.quantity');
  const waitTimerInputId = useId();

  const update = (patch: Partial<ApplicationGuidance>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {t('method')}
          </span>
          <Select
            value={value.applicationMethod ?? ''}
            onValueChange={(v) =>
              update({
                applicationMethod: (v as ApplicationMethod) || null,
              })
            }
          >
            <SelectTrigger aria-label={t('method')} className="h-11">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {METHOD_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {tMethod(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col">
          <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {t('quantity')}
          </span>
          <Select
            value={value.quantity ?? ''}
            onValueChange={(v) =>
              update({ quantity: (v as Quantity) || null })
            }
          >
            <SelectTrigger aria-label={t('quantity')} className="h-11">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {QUANTITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {tQty(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[14px] font-semibold">
            {t('steps')}
          </span>
          <button
            type="button"
            onClick={() => update({ steps: [...value.steps, ''] })}
            className="inline-flex items-center gap-1 rounded-full bg-accent-strong px-3 py-1.5 text-xs font-semibold text-surface shadow-soft transition hover:-translate-y-0.5 hover:opacity-95"
          >
            <Plus className="h-3 w-3" />
            {t('addStep')}
          </button>
        </div>
        {errors?.steps ? (
          <p className="mb-2 text-sm text-danger" role="alert">
            {errors.steps}
          </p>
        ) : null}
        <ol className="flex flex-col gap-2">
          {value.steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-xl bg-surface-muted p-2"
            >
              <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-strong text-[11px] font-bold text-surface">
                {index + 1}
              </span>
              <input
                value={step}
                aria-label={t('stepInput', { index: index + 1 })}
                onChange={(e) => {
                  const next = [...value.steps];
                  next[index] = e.target.value;
                  update({ steps: next });
                }}
                className="flex-1 bg-transparent py-1 text-[14px] outline-none"
              />
              <button
                type="button"
                aria-label={t('removeStep', { index: index + 1 })}
                onClick={() =>
                  update({
                    steps: value.steps.filter((_, i) => i !== index),
                  })
                }
                className="flex-none rounded-full p-1.5 text-muted hover:bg-surface hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[14px] font-semibold">
            {t('cautions')}
          </span>
          <button
            type="button"
            onClick={() => update({ cautions: [...value.cautions, ''] })}
            className="inline-flex items-center gap-1 rounded-full bg-accent-strong px-3 py-1.5 text-xs font-semibold text-surface shadow-soft transition hover:-translate-y-0.5 hover:opacity-95"
          >
            <Plus className="h-3 w-3" />
            {t('addCaution')}
          </button>
        </div>
        {errors?.cautions ? (
          <p className="mb-2 text-sm text-danger" role="alert">
            {errors.cautions}
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {value.cautions.map((caution, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-xl bg-warning/10 p-2 text-warning"
            >
              <AlertTriangle className="mt-1.5 h-3.5 w-3.5 flex-none" />
              <input
                value={caution}
                aria-label={t('cautionInput', { index: index + 1 })}
                onChange={(e) => {
                  const next = [...value.cautions];
                  next[index] = e.target.value;
                  update({ cautions: next });
                }}
                className="flex-1 bg-transparent py-1 text-[14px] outline-none placeholder:text-warning/60"
              />
              <button
                type="button"
                aria-label={t('removeCaution', { index: index + 1 })}
                onClick={() =>
                  update({
                    cautions: value.cautions.filter((_, i) => i !== index),
                  })
                }
                className="flex-none rounded-full p-1.5 text-warning/70 hover:bg-warning/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor={waitTimerInputId}
          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          {t('waitTimerLabel')}
        </label>
        <span className="mb-2 text-xs text-muted">{t('waitTimerHint')}</span>
        <input
          id={waitTimerInputId}
          type="number"
          min={0}
          value={value.waitMinutes ?? ''}
          onChange={(e) =>
            update({
              waitMinutes:
                e.target.value === ''
                  ? null
                  : Math.max(0, Number(e.target.value)),
            })
          }
          className="w-40 rounded-xl border border-border bg-surface px-3 py-2 text-[14px]"
          placeholder={t('waitTimerPlaceholder')}
        />
      </div>

      <p className="text-xs text-muted">{t('routineNote')}</p>
    </div>
  );
}
