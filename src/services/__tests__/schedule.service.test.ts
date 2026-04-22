jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
  putRequest: jest.fn(),
}));

import * as api from '@/lib/api';
import * as scheduleService from '@/services/schedule.service';
import { DayOfWeek, SchedulePreset, SlotMode } from '@/types/schedule';

afterEach(() => {
  jest.clearAllMocks();
});

describe('schedule.service', () => {
  it('fetches today with the client timezone header', async () => {
    (api.getRequest as jest.Mock).mockResolvedValue({
      dayOfWeek: DayOfWeek.Mon,
      slots: [],
    });

    await scheduleService.getTodaysSchedule();

    expect(api.getRequest).toHaveBeenCalledWith('/schedule/today', {
      headers: {
        'x-timezone': expect.any(String),
      },
    });
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
});
