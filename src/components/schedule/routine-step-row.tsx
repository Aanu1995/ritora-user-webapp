'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MAX_CUSTOM_LABEL_LENGTH,
  MAX_STEP_NOTES_LENGTH,
  type RoutineStepInput,
  type RoutineStepProductSummary,
  StepLabel,
} from '@/types/schedule';
import { cn } from '@/lib/utils';

const STEP_LABEL_ORDER: StepLabel[] = [
  StepLabel.Cleanser,
  StepLabel.Toner,
  StepLabel.Essence,
  StepLabel.Serum,
  StepLabel.Exfoliant,
  StepLabel.Treatment,
  StepLabel.Mask,
  StepLabel.EyeCare,
  StepLabel.LipCare,
  StepLabel.Moisturizer,
  StepLabel.SunProtection,
  StepLabel.Other,
  StepLabel.Custom,
];

type RoutineStepRowProps = {
  index: number;
  step: RoutineStepInput;
  product: RoutineStepProductSummary | null;
  onChange: (next: RoutineStepInput) => void;
  onOpenProductPicker: () => void;
  onRemove: () => void;
};

export function RoutineStepRow({
  index,
  step,
  product,
  onChange,
  onOpenProductPicker,
  onRemove,
}: RoutineStepRowProps) {
  const t = useTranslations('schedule');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id ?? `new-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm transition',
        isDragging && 'border-dashed border-accent/60 bg-accent-soft/40 opacity-50',
      )}
    >
        <button
          type="button"
          aria-label={t('step.dragHandle')}
          style={{ touchAction: 'none' }}
          className="mt-1 cursor-grab rounded-md p-1 text-muted hover:bg-surface-muted hover:text-foreground active:cursor-grabbing active:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>

        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Step label */}
          <Select
            value={step.stepLabel}
            onValueChange={(value) =>
              onChange({ ...step, stepLabel: value as StepLabel })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={t('step.labelPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {STEP_LABEL_ORDER.map((label) => (
                <SelectItem key={label} value={label}>
                  {t(`stepLabels.${label}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {step.stepLabel === StepLabel.Custom ? (
            <input
              type="text"
              value={step.customLabel ?? ''}
              onChange={(e) =>
                onChange({
                  ...step,
                  customLabel: e.target.value.slice(
                    0,
                    MAX_CUSTOM_LABEL_LENGTH,
                  ),
                })
              }
              placeholder={t('step.labelPlaceholder')}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
              maxLength={MAX_CUSTOM_LABEL_LENGTH}
            />
          ) : null}

          {/* Product picker */}
          <button
            type="button"
            onClick={onOpenProductPicker}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition hover:border-accent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            )}
          >
            {product ? (
              <>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-muted">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted">
                      {product.category.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {product.brand}
                  </span>
                  <span className="block truncate text-[11px] text-muted">
                    {product.name}
                  </span>
                </span>
              </>
            ) : step.inventoryProductId ? (
              <span
                style={{ color: 'var(--daypart-morning-fg)' }}
                className="flex items-center gap-2"
              >
                <span
                  style={{
                    backgroundColor: 'var(--daypart-morning-accent)',
                  }}
                  className="h-2 w-2 rounded-full"
                />
                {t('step.productMissing')}
              </span>
            ) : (
              <span className="text-muted">
                {t('step.productPlaceholder')}
              </span>
            )}
          </button>

          {/* Notes */}
          <input
            type="text"
            value={step.notes ?? ''}
            onChange={(e) =>
              onChange({
                ...step,
                notes: e.target.value.slice(0, MAX_STEP_NOTES_LENGTH),
              })
            }
            placeholder={t('step.notesPlaceholder')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
            maxLength={MAX_STEP_NOTES_LENGTH}
          />

          {/* Optional checkbox */}
          <label className="flex items-center gap-2 text-[11px] text-muted">
            <input
              type="checkbox"
              checked={step.optional ?? false}
              onChange={(e) =>
                onChange({ ...step, optional: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-border"
            />
            {t('step.optionalLabel')}
          </label>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={t('step.delete')}
          className="mt-1 rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
    </div>
  );
}
