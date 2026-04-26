jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
  putRequest: jest.fn(),
}));

import * as api from '@/lib/api';
import * as scheduleService from '@/services/schedule.service';
import { DayOfWeek, SchedulePreset, SlotMode, StepLabel } from '@/types/schedule';

afterEach(() => {
  jest.clearAllMocks();
});

describe('schedule.service', () => {
  it('fetches the full schedule', async () => {
    (api.getRequest as jest.Mock).mockResolvedValue({
      timeZone: 'Europe/Stockholm',
      slots: [],
    });

    await scheduleService.getSchedule();

    expect(api.getRequest).toHaveBeenCalledWith('/schedule');
  });

  it('fetches today from the schedule endpoint without per-call headers', async () => {
    (api.getRequest as jest.Mock).mockResolvedValue({
      dayOfWeek: DayOfWeek.Mon,
      timeZone: 'Europe/Stockholm',
      slots: [],
    });

    await scheduleService.getTodaysSchedule();

    expect(api.getRequest).toHaveBeenCalledWith('/schedule/today');
  });

  it('creates multiple slots through the batch endpoint', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ slots: [] });

    await scheduleService.createSlots({
      daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
      slotTime: '08:00',
      mode: SlotMode.AI,
    });

    expect(api.postRequest).toHaveBeenCalledWith('/schedule/slots/batch', {
      daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
      slotTime: '08:00',
      mode: SlotMode.AI,
    });
  });

  it('creates one slot through the slots endpoint', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await scheduleService.createSlot({
      dayOfWeek: DayOfWeek.Mon,
      slotTime: '08:00',
      mode: SlotMode.Manual,
    });

    expect(api.postRequest).toHaveBeenCalledWith('/schedule/slots', {
      dayOfWeek: DayOfWeek.Mon,
      slotTime: '08:00',
      mode: SlotMode.Manual,
    });
  });

  it('keeps the every-day preset endpoint for compatibility', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ slots: [] });

    await scheduleService.applyEveryDayPreset({
      preset: SchedulePreset.EveryDay,
      slotTime: '21:00',
      mode: SlotMode.Manual,
    });

    expect(api.postRequest).toHaveBeenCalledWith('/schedule/apply-preset', {
      preset: SchedulePreset.EveryDay,
      slotTime: '21:00',
      mode: SlotMode.Manual,
    });
  });

  it('updates a slot by id', async () => {
    (api.patchRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await scheduleService.updateSlot('slot-1', {
      slotTime: '09:30',
      slotNotes: 'After cleanser',
    });

    expect(api.patchRequest).toHaveBeenCalledWith('/schedule/slots/slot-1', {
      slotTime: '09:30',
      slotNotes: 'After cleanser',
    });
  });

  it('deletes a slot by id', async () => {
    (api.deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await scheduleService.deleteSlot('slot-1');

    expect(api.deleteRequest).toHaveBeenCalledWith('/schedule/slots/slot-1');
  });

  it('upserts routine steps for a slot', async () => {
    (api.putRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await scheduleService.upsertSteps('slot-1', {
      steps: [
        {
          stepOrder: 0,
          inventoryProductId: null,
          stepLabel: StepLabel.Cleanser,
        },
      ],
    });

    expect(api.putRequest).toHaveBeenCalledWith('/schedule/slots/slot-1/steps', {
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
    (api.postRequest as jest.Mock).mockResolvedValue({ id: 'slot-1' });

    await scheduleService.moveSlot('slot-1', {
      toDay: DayOfWeek.Wed,
      toTime: '20:00',
    });

    expect(api.postRequest).toHaveBeenCalledWith('/schedule/slots/slot-1/move', {
      toDay: DayOfWeek.Wed,
      toTime: '20:00',
    });
  });
});
