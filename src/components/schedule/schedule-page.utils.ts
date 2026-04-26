import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_ORDER,
  DayOfWeek,
  type ScheduleSlot,
} from '@/types/schedule';

const EMPTY_SCHEDULE_BY_DAY: Record<DayOfWeek, ScheduleSlot[]> = {
  [DayOfWeek.Mon]: [],
  [DayOfWeek.Tue]: [],
  [DayOfWeek.Wed]: [],
  [DayOfWeek.Thu]: [],
  [DayOfWeek.Fri]: [],
  [DayOfWeek.Sat]: [],
  [DayOfWeek.Sun]: [],
};

export function groupSlotsByDay(
  slots: ScheduleSlot[],
): Record<DayOfWeek, ScheduleSlot[]> {
  const grouped = {
    [DayOfWeek.Mon]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Mon]],
    [DayOfWeek.Tue]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Tue]],
    [DayOfWeek.Wed]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Wed]],
    [DayOfWeek.Thu]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Thu]],
    [DayOfWeek.Fri]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Fri]],
    [DayOfWeek.Sat]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Sat]],
    [DayOfWeek.Sun]: [...EMPTY_SCHEDULE_BY_DAY[DayOfWeek.Sun]],
  };

  for (const slot of slots) {
    grouped[slot.dayOfWeek].push(slot);
  }

  for (const day of DAYS_OF_WEEK) {
    grouped[day].sort((left, right) => left.slotTime.localeCompare(right.slotTime));
  }

  return grouped;
}

export function orderedDaysStartingToday(today: DayOfWeek): DayOfWeek[] {
  const todayIndex = DAY_OF_WEEK_ORDER[today];

  return [...DAYS_OF_WEEK].sort((leftDay, rightDay) => {
    const leftOffset = (DAY_OF_WEEK_ORDER[leftDay] - todayIndex + 7) % 7;
    const rightOffset = (DAY_OF_WEEK_ORDER[rightDay] - todayIndex + 7) % 7;
    return leftOffset - rightOffset;
  });
}

export function findScheduleSlotById(
  slots: ScheduleSlot[],
  slotId: string | null,
): ScheduleSlot | null {
  if (!slotId) {
    return null;
  }

  return slots.find((slot) => slot.id === slotId) ?? null;
}

export function buildSchedulePageHrefWithoutSlotParam(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete('slot');

  return nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;
}
