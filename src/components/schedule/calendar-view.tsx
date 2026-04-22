'use client';

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { GripVertical, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMoveSlot } from '@/hooks/use-schedule';
import { getApiErrorCode } from '@/lib/api-error';
import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_ORDER,
  DayOfWeek,
  ScheduleApiErrorCode,
  type ScheduleSlot,
  SlotMode,
  formatSlotTimeLabel,
} from '@/types/schedule';
import { cn } from '@/lib/utils';

type CalendarViewProps = {
  slots: ScheduleSlot[];
  today: DayOfWeek;
  onSlotClick: (slotId: string) => void;
  onAddTime: (day: DayOfWeek) => void;
};

function groupByDay(
  slots: ScheduleSlot[],
): Record<DayOfWeek, ScheduleSlot[]> {
  const base = DAYS_OF_WEEK.reduce<Record<DayOfWeek, ScheduleSlot[]>>(
    (acc, day) => {
      acc[day] = [];
      return acc;
    },
    {
      [DayOfWeek.Mon]: [],
      [DayOfWeek.Tue]: [],
      [DayOfWeek.Wed]: [],
      [DayOfWeek.Thu]: [],
      [DayOfWeek.Fri]: [],
      [DayOfWeek.Sat]: [],
      [DayOfWeek.Sun]: [],
    },
  );
  for (const slot of slots) {
    base[slot.dayOfWeek].push(slot);
  }
  for (const day of DAYS_OF_WEEK) {
    base[day].sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }
  return base;
}

function getSlotCardStyles(slot: ScheduleSlot) {
  const isManual = slot.mode === SlotMode.Manual;
  return {
    isManual,
    cardStyle: isManual
      ? {
          backgroundColor: 'var(--accent-soft)',
          borderLeftColor: 'var(--accent)',
        }
      : {
          backgroundColor: 'var(--ai-soft)',
          borderLeftColor: 'var(--ai-strong)',
        },
    badgeStyle: isManual
      ? {
          backgroundColor: 'var(--accent)',
          color: 'var(--surface)',
        }
      : {
          backgroundColor: 'var(--ai-badge-bg)',
          color: 'var(--ai-badge-fg)',
        },
  };
}

function SlotCardVisual({
  slot,
  onClick,
  dragHandleProps,
  isDragging,
  isOverlay,
}: {
  slot: ScheduleSlot;
  onClick?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  const t = useTranslations('schedule');
  const { isManual, cardStyle, badgeStyle } = getSlotCardStyles(slot);
  return (
    <div
      style={cardStyle}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border-l-[3px] px-2 py-1.5 text-left text-[11px] transition',
        isDragging && 'opacity-30',
        isOverlay && 'rotate-2 cursor-grabbing shadow-hero',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={onClick}
          disabled={isOverlay}
          className="flex-1 text-left text-[13px] font-bold tabular-nums text-foreground focus-visible:outline-none"
        >
          {formatSlotTimeLabel(slot.slotTime)}
        </button>
        {dragHandleProps ? (
          <button
            type="button"
            aria-label={t('step.dragHandle')}
            style={{ touchAction: 'none' }}
            className="cursor-grab rounded p-0.5 text-muted hover:bg-surface hover:text-foreground active:cursor-grabbing active:text-foreground"
            {...dragHandleProps}
          >
            <GripVertical className="h-3 w-3" aria-hidden />
          </button>
        ) : isOverlay ? (
          <span className="cursor-grabbing rounded p-0.5 text-foreground">
            <GripVertical className="h-3 w-3" aria-hidden />
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={isOverlay}
        className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide focus-visible:outline-none"
      >
        <span
          style={badgeStyle}
          className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5"
        >
          {isManual ? t('mode.manualShort') : t('mode.aiShort')}
        </span>
        {isManual && slot.steps.length > 0 ? (
          <span className="text-muted">
            {t('slot.stepCount', { count: slot.steps.length })}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function DraggableSlotCard({
  slot,
  onClick,
}: {
  slot: ScheduleSlot;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: slot.id,
    data: { type: 'slot', slot },
  });

  return (
    <div ref={setNodeRef}>
      <SlotCardVisual
        slot={slot}
        onClick={onClick}
        dragHandleProps={{
          ...attributes,
          ...(listeners as React.HTMLAttributes<HTMLButtonElement>),
        }}
        isDragging={isDragging}
      />
    </div>
  );
}

function DroppableDayColumn({
  day,
  isToday,
  slots,
  onAddTime,
  children,
}: {
  day: DayOfWeek;
  isToday: boolean;
  slots: ScheduleSlot[];
  onAddTime: (day: DayOfWeek) => void;
  children?: React.ReactNode;
}) {
  const t = useTranslations('schedule');
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${day}`,
    data: { type: 'day-column', day },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-60 flex-col gap-2 rounded-xl border bg-surface p-2 transition',
        isToday ? 'border-accent bg-accent-soft' : 'border-border',
        isOver &&
          'scale-[1.02] border-accent bg-accent-soft shadow-lg ring-2 ring-accent ring-offset-2 ring-offset-background',
      )}
    >
      <div className="border-b border-dashed border-border pb-1 text-center text-[11px] font-bold uppercase tracking-wide text-muted">
        {t(`days.${day}Short`)}
        {isToday ? (
          <span className="ml-1 text-[10px] font-semibold text-accent-strong">
            · {t('daySection.todayBadge')}
          </span>
        ) : null}
      </div>
      <div className="flex-1 space-y-1.5">
        {children}
        {slots.length === 0 ? (
          <p className="flex h-full min-h-20 items-center justify-center text-center text-[10px] italic text-muted">
            {t('calendar.noRoutines')}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onAddTime(day)}
        className="flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-semibold text-accent-strong transition hover:bg-accent-soft"
      >
        <Plus className="h-3 w-3" aria-hidden />
        {t('calendar.addShort')}
      </button>
    </div>
  );
}

export function CalendarView({
  slots,
  today,
  onSlotClick,
  onAddTime,
}: CalendarViewProps) {
  const t = useTranslations('schedule');
  const grouped = useMemo(() => groupByDay(slots), [slots]);
  const orderedDays = useMemo(() => {
    const todayIndex = DAY_OF_WEEK_ORDER[today];
    return [...DAYS_OF_WEEK].sort((a, b) => {
      const aOffset = (DAY_OF_WEEK_ORDER[a] - todayIndex + 7) % 7;
      const bOffset = (DAY_OF_WEEK_ORDER[b] - todayIndex + 7) % 7;
      return aOffset - bOffset;
    });
  }, [today]);
  const moveSlot = useMoveSlot();
  const [activeSlot, setActiveSlot] = useState<ScheduleSlot | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const slot = event.active.data.current?.slot as ScheduleSlot | undefined;
    setActiveSlot(slot ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSlot(null);
    const { active, over } = event;
    if (!over) return;
    const slot = active.data.current?.slot as ScheduleSlot | undefined;
    const targetDay = over.data.current?.day as DayOfWeek | undefined;
    if (!slot || !targetDay || slot.dayOfWeek === targetDay) return;

    moveSlot.mutate(
      {
        id: slot.id,
        payload: { toDay: targetDay, toTime: slot.slotTime },
      },
      {
        onError: (error) => {
          const message =
            getApiErrorCode(error) === ScheduleApiErrorCode.MoveConflict
              ? t('save.errorConflictMove')
              : t('save.errorGeneric');
          toast.error(message);
        },
        onSuccess: () => {
          toast.success(t('save.saved'));
        },
      },
    );
  };

  const handleDragCancel = () => setActiveSlot(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{t('calendar.dragHint')}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          }}
        >
          {orderedDays.map((day) => (
            <DroppableDayColumn
              key={day}
              day={day}
              isToday={day === today}
              slots={grouped[day]}
              onAddTime={onAddTime}
            >
              {grouped[day].map((slot) => (
                <DraggableSlotCard
                  key={slot.id}
                  slot={slot}
                  onClick={() => onSlotClick(slot.id)}
                />
              ))}
            </DroppableDayColumn>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeSlot ? <SlotCardVisual slot={activeSlot} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
