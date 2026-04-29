jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
  putRequest: jest.fn(),
}));

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '@/lib/api';
import {
  applyEveryDayPreset,
  createSlot,
  createSlots,
  deleteSlot,
  getSchedule,
  getTodaysSchedule,
  moveSlot,
  updateSlot,
  upsertSteps,
} from '@/services/schedule.service';
import { DayOfWeek, SchedulePreset, SlotMode, StepLabel } from '@/types/schedule';

afterEach(() => {
  jest.clearAllMocks();
});

describe('schedule.service', () => {
  it('fetches the full schedule', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      timeZone: 'Europe/Stockholm',
      slots: [],
    });

    await getSchedule();

    expect(getRequest).toHaveBeenCalledWith('/schedule');
  });

  it('fetches today from the schedule endpoint without per-call headers', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      dayOfWeek: DayOfWeek.Mon,
      timeZone: 'Europe/Stockholm',
      slots: [],
    });

    await getTodaysSchedule();

    expect(getRequest).toHaveBeenCalledWith('/schedule/today');
  });

  it('creates multiple slots through the batch endpoint', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ slots: [] });

    await createSlots({
      daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
      slotTime: '08:00',
      mode: SlotMode.AI,
    });

    expect(postRequest).toHaveBeenCalledWith('/schedule/slots/batch', {
      daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
      slotTime: '08:00',
      mode: SlotMode.AI,
    });
  });

  it('creates one slot through the slots endpoint', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await createSlot({
      dayOfWeek: DayOfWeek.Mon,
      slotTime: '08:00',
      mode: SlotMode.Manual,
    });

    expect(postRequest).toHaveBeenCalledWith('/schedule/slots', {
      dayOfWeek: DayOfWeek.Mon,
      slotTime: '08:00',
      mode: SlotMode.Manual,
    });
  });

  it('applies the every-day preset through the preset endpoint', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ slots: [] });

    await applyEveryDayPreset({
      preset: SchedulePreset.EveryDay,
      slotTime: '21:00',
      mode: SlotMode.Manual,
    });

    expect(postRequest).toHaveBeenCalledWith('/schedule/apply-preset', {
      preset: SchedulePreset.EveryDay,
      slotTime: '21:00',
      mode: SlotMode.Manual,
    });
  });

  it('updates a slot by id', async () => {
    (patchRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await updateSlot('slot-1', {
      slotTime: '09:30',
      slotNotes: 'After cleanser',
    });

    expect(patchRequest).toHaveBeenCalledWith('/schedule/slots/slot-1', {
      slotTime: '09:30',
      slotNotes: 'After cleanser',
    });
  });

  it('deletes a slot by id', async () => {
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteSlot('slot-1');

    expect(deleteRequest).toHaveBeenCalledWith('/schedule/slots/slot-1');
  });

  it('upserts routine steps for a slot', async () => {
    (putRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await upsertSteps('slot-1', {
      steps: [
        {
          stepOrder: 0,
          inventoryProductId: null,
          stepLabel: StepLabel.Cleanser,
        },
      ],
    });

    expect(putRequest).toHaveBeenCalledWith('/schedule/slots/slot-1/steps', {
      steps: [
        {
          stepOrder: 0,
          inventoryProductId: null,
          stepLabel: StepLabel.Cleanser,
        },
      ],
    });
  });

  it('moves a slot to another day and time', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await moveSlot('slot-1', {
      toDay: DayOfWeek.Wed,
      toTime: '20:00',
    });

    expect(postRequest).toHaveBeenCalledWith('/schedule/slots/slot-1/move', {
      toDay: DayOfWeek.Wed,
      toTime: '20:00',
    });
  });
});
