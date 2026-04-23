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
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
import {
  MAX_STEPS_PER_SLOT,
  type RoutineStepInput,
  type RoutineStepProductSummary,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import {
  createRoutineStepInput,
  findRoutineStepIndexByRowId,
  getRoutineStepProduct,
  getRoutineStepRowId,
  removeRoutineStepAtIndex,
  replaceRoutineStepAtIndex,
} from './routine-step-list.utils';
import { RoutineStepRow } from './routine-step-row';
import { ScheduleRenderProfiler } from './schedule-render-profiler';

type RoutineStepListProps = {
  steps: RoutineStepInput[];
  productLookup: Map<string, RoutineStepProductSummary>;
  onChange: (steps: RoutineStepInput[]) => void;
  onProductPicked: (product: RoutineStepProductSummary) => void;
  onProductPickerClose?: () => void;
  errorText?: string;
};
const NOOP_STEP_CHANGE = () => undefined;
const NOOP_ROW_ACTION = () => undefined;

export function RoutineStepList({
  steps,
  productLookup,
  onChange,
  onProductPicked,
  onProductPickerClose,
  errorText,
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
  const pendingProductSelection = useScheduleUiStore(
    (state) => state.pendingProductSelection,
  );
  const stepsRef = useRef(steps);

  // DnD handlers need the freshest step order, but we still want stable callbacks
  // so each row does not receive brand-new handlers on every keystroke.
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(
    () => steps.map((step, index) => getRoutineStepRowId(step, index)),
    [steps],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const currentSteps = stepsRef.current;
    const oldIndex = findRoutineStepIndexByRowId(currentSteps, String(active.id));
    const newIndex = findRoutineStepIndexByRowId(currentSteps, String(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(currentSteps, oldIndex, newIndex).map((s, i) => ({
      ...s,
      stepOrder: i,
    }));
    onChange(reordered);
  }, [onChange]);

  const handleDragCancel = useCallback(() => setActiveDragId(null), []);

  const updateStep = useCallback((index: number, next: RoutineStepInput) => {
    onChange(replaceRoutineStepAtIndex(stepsRef.current, index, next));
  }, [onChange]);

  const removeStep = useCallback((index: number) => {
    onChange(removeRoutineStepAtIndex(stepsRef.current, index));
  }, [onChange]);

  const addStep = useCallback(() => {
    const currentSteps = stepsRef.current;
    if (currentSteps.length >= MAX_STEPS_PER_SLOT) {
      return;
    }

    const newStep = createRoutineStepInput(newIdPrefix, currentSteps.length);
    onChange([...currentSteps, newStep]);
  }, [newIdPrefix, onChange]);

  const handleOpenProductPicker = useCallback(
    (index: number) => {
      const step = stepsRef.current[index];

      if (!step) {
        return;
      }

      openProductPicker(index, step.stepLabel);
    },
    [openProductPicker],
  );
  const handleCloseProductPicker = useCallback(() => {
    onProductPickerClose?.();
    closeProductPicker();
  }, [closeProductPicker, onProductPickerClose]);

  const canAdd = steps.length < MAX_STEPS_PER_SLOT;
  const pickerOpen =
    pickerStepIndex !== null &&
    pickerStepIndex >= 0 &&
    pickerStepIndex < steps.length;
  const activeDragStepIndex = activeDragId
    ? findRoutineStepIndexByRowId(steps, activeDragId)
    : -1;
  const activeDragStep =
    activeDragStepIndex >= 0 ? steps[activeDragStepIndex] : null;

  useEffect(() => {
    if (pickerStepIndex !== null && !pickerOpen) {
      handleCloseProductPicker();
    }
  }, [handleCloseProductPicker, pickerOpen, pickerStepIndex]);

  useEffect(() => {
    return () => {
      closeProductPicker();
    };
  }, [closeProductPicker]);

  // Store-bridge consumer: the inline or mobile picker writes the selected
  // product into `pendingProductSelection`; we apply it to the current step
  // here so form state stays owned by this component.
  useEffect(() => {
    if (!pendingProductSelection || pickerStepIndex === null) return;

    const step = stepsRef.current[pickerStepIndex];
    if (!step) {
      handleCloseProductPicker();
      return;
    }

    onProductPicked(pendingProductSelection);
    updateStep(pickerStepIndex, {
      ...step,
      inventoryProductId: pendingProductSelection.id,
    });
    handleCloseProductPicker();
  }, [
    handleCloseProductPicker,
    onProductPicked,
    pendingProductSelection,
    pickerStepIndex,
    updateStep,
  ]);

  return (
    <ScheduleRenderProfiler id="schedule.routine-step-list">
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
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {steps.map((step, index) => {
                  const rowId = getRoutineStepRowId(step, index);
                  return (
                    <li key={rowId}>
                      <RoutineStepRow
                        index={index}
                        step={step}
                        product={getRoutineStepProduct(step, productLookup)}
                        onChange={updateStep}
                        onOpenProductPicker={handleOpenProductPicker}
                        onRemove={removeStep}
                      />
                    </li>
                  );
                })}
              </ul>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeDragStep ? (
                <div className="pointer-events-none rotate-1 cursor-grabbing shadow-hero">
                  <RoutineStepRow
                    index={activeDragStepIndex}
                    step={activeDragStep}
                    product={getRoutineStepProduct(activeDragStep, productLookup)}
                    onChange={NOOP_STEP_CHANGE}
                    onOpenProductPicker={NOOP_ROW_ACTION}
                    onRemove={NOOP_ROW_ACTION}
                  />
                </div>
              ) : null}
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

        {errorText ? (
          <p className="mt-2 text-xs text-danger" role="alert">
            {errorText}
          </p>
        ) : null}
      </div>
    </ScheduleRenderProfiler>
  );
}
