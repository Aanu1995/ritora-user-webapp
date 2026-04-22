'use client';

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
import {
  MAX_STEPS_PER_SLOT,
  type RoutineStep,
  type RoutineStepInput,
  type RoutineStepProductSummary,
  StepLabel,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { ProductPickerSheet } from './product-picker-sheet';
import { RoutineStepRow } from './routine-step-row';

type RoutineStepListProps = {
  steps: RoutineStepInput[];
  productLookup: Map<string, RoutineStepProductSummary>;
  onChange: (steps: RoutineStepInput[]) => void;
  onProductPicked: (product: RoutineStepProductSummary) => void;
};

export function stepsFromEntity(entitySteps: RoutineStep[]): RoutineStepInput[] {
  return entitySteps
    .slice()
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((s, index) => ({
      id: s.id,
      stepOrder: index,
      inventoryProductId: s.inventoryProductId,
      stepLabel: s.stepLabel,
      customLabel: s.customLabel,
      notes: s.notes,
      optional: s.optional,
    }));
}

export function buildProductLookup(
  entitySteps: RoutineStep[],
): Map<string, RoutineStepProductSummary> {
  const map = new Map<string, RoutineStepProductSummary>();
  for (const step of entitySteps) {
    if (step.product) map.set(step.product.id, step.product);
  }
  return map;
}

export function RoutineStepList({
  steps,
  productLookup,
  onChange,
  onProductPicked,
}: RoutineStepListProps) {
  const t = useTranslations('schedule.editor');
  const newIdPrefix = useId();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const pickerStepIndex = useScheduleUiStore(
    (state) => state.productPickerOpenForStepIndex,
  );
  const openProductPicker = useScheduleUiStore(
    (state) => state.openProductPicker,
  );
  const closeProductPicker = useScheduleUiStore(
    (state) => state.closeProductPicker,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex(
      (s) => (s.id ?? `new-${steps.indexOf(s)}`) === active.id,
    );
    const newIndex = steps.findIndex(
      (s) => (s.id ?? `new-${steps.indexOf(s)}`) === over.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({
      ...s,
      stepOrder: i,
    }));
    onChange(reordered);
  };

  const handleDragCancel = () => setActiveDragId(null);

  const updateStep = (index: number, next: RoutineStepInput) => {
    const clone = steps.slice();
    clone[index] = next;
    onChange(clone);
  };

  const removeStep = (index: number) => {
    const clone = steps.slice();
    clone.splice(index, 1);
    onChange(clone.map((s, i) => ({ ...s, stepOrder: i })));
  };

  const addStep = () => {
    if (steps.length >= MAX_STEPS_PER_SLOT) return;
    const newStep: RoutineStepInput = {
      id: `${newIdPrefix}-${steps.length}-${Date.now()}`,
      stepOrder: steps.length,
      inventoryProductId: null,
      stepLabel: StepLabel.Cleanser,
      customLabel: null,
      notes: null,
      optional: false,
    };
    onChange([...steps, newStep]);
  };

  const canAdd = steps.length < MAX_STEPS_PER_SLOT;
  const pickerOpen =
    pickerStepIndex !== null && pickerStepIndex >= 0 && pickerStepIndex < steps.length;

  useEffect(() => {
    if (pickerStepIndex !== null && !pickerOpen) {
      closeProductPicker();
    }
  }, [closeProductPicker, pickerOpen, pickerStepIndex]);

  useEffect(() => {
    return () => {
      closeProductPicker();
    };
  }, [closeProductPicker]);

  const handleProductSelect = (product: RoutineStepProductSummary) => {
    if (pickerStepIndex === null) {
      return;
    }

    const step = steps[pickerStepIndex];
    if (!step) {
      closeProductPicker();
      return;
    }

    onProductPicked(product);
    updateStep(pickerStepIndex, {
      ...step,
      inventoryProductId: product.id,
    });
    closeProductPicker();
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t('stepsLabel')}
        </p>
        <p className="text-xs text-muted">
          {t('stepsCount', {
            current: steps.length,
            max: MAX_STEPS_PER_SLOT,
          })}
        </p>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        {t('stepsDescription')}
      </p>

      {steps.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted/30 p-4 text-center text-xs leading-relaxed text-muted">
          {t('manualEmpty')}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={steps.map((s, i) => s.id ?? `new-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {steps.map((step, index) => {
                const rowId = step.id ?? `new-${index}`;
                return (
                  <li key={rowId}>
                    <RoutineStepRow
                      index={index}
                      step={step}
                      product={
                        step.inventoryProductId
                          ? productLookup.get(step.inventoryProductId) ?? null
                          : null
                      }
                      onChange={(next) => updateStep(index, next)}
                      onOpenProductPicker={() => openProductPicker(index)}
                      onRemove={() => removeStep(index)}
                    />
                  </li>
                );
              })}
            </ul>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragId
              ? (() => {
                  const idx = steps.findIndex(
                    (s, i) => (s.id ?? `new-${i}`) === activeDragId,
                  );
                  if (idx < 0) return null;
                  const step = steps[idx];
                  return (
                    <div className="pointer-events-none rotate-1 cursor-grabbing shadow-hero">
                      <RoutineStepRow
                        index={idx}
                        step={step}
                        product={
                          step.inventoryProductId
                            ? productLookup.get(step.inventoryProductId) ??
                              null
                            : null
                        }
                        onChange={() => undefined}
                        onOpenProductPicker={() => undefined}
                        onRemove={() => undefined}
                      />
                    </div>
                  );
                })()
              : null}
          </DragOverlay>
        </DndContext>
      )}

      <button
        type="button"
        onClick={addStep}
        disabled={!canAdd}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-xs font-semibold text-muted transition',
          canAdd
            ? 'hover:border-accent hover:text-accent-strong'
            : 'cursor-not-allowed opacity-50',
        )}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {canAdd ? t('addStep') : t('stepsMaxReached', { max: MAX_STEPS_PER_SLOT })}
      </button>

      {pickerOpen ? (
        <ProductPickerSheet
          open={pickerOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeProductPicker();
            }
          }}
          onSelect={handleProductSelect}
        />
      ) : null}
    </div>
  );
}
