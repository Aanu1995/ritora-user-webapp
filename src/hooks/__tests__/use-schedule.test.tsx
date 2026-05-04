import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryKey } from '@/constants/query-keys';
import {
  DayOfWeek,
  SchedulePreset,
  SlotMode,
  StepLabel,
  type Schedule,
  type ScheduleSlot,
} from '@/types/schedule';
import { useAuthStore } from '@/stores/auth-store';
import {
  useApplyPreset,
  useCreateSlot,
  useCreateSlots,
  useDeleteSlot,
  useMoveSlot,
  useSchedule,
  useTodaysSchedule,
  useUpdateSlot,
  useUpsertSteps,
} from '@/hooks/use-schedule';

jest.mock('@/services/schedule.service', () => ({
  applyEveryDayPreset: jest.fn(),
  createSlot: jest.fn(),
  createSlots: jest.fn(),
  deleteSlot: jest.fn(),
  getSchedule: jest.fn(),
  getTodaysSchedule: jest.fn(),
  moveSlot: jest.fn(),
  updateSlot: jest.fn(),
  upsertSteps: jest.fn(),
}));

import {
  applyEveryDayPreset,
  createSlot as createScheduleSlot,
  createSlots,
  deleteSlot,
  getSchedule,
  getTodaysSchedule,
  moveSlot,
  updateSlot,
  upsertSteps,
} from '@/services/schedule.service';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createSlot(id: string, dayOfWeek: DayOfWeek): ScheduleSlot {
  return {
    id,
    dayOfWeek,
    slotTime: '08:00',
    mode: SlotMode.Manual,
    slotNotes: null,
    steps: [
      {
        id: `${id}-step-1`,
        stepOrder: 0,
        inventoryProductId: null,
        stepLabel: StepLabel.Cleanser,
        customLabel: null,
        notes: null,
        optional: false,
        isSpecialistLocked: false,
        product: null,
        createdAt: '2026-04-17T00:00:00.000Z',
        updatedAt: '2026-04-17T00:00:00.000Z',
      },
    ],
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
  };
}

function expectTodaysScheduleInvalidated(queryClient: QueryClient) {
  expect(
    queryClient.getQueryState([QueryKey.ScheduleToday])?.isInvalidated,
  ).toBe(true);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useSchedule', () => {
  it('stays idle until the user is authenticated', () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSchedule(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches the full schedule once authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const queryClient = createTestQueryClient();
    const schedule: Schedule = {
      timeZone: 'Europe/Stockholm',
      slots: [createSlot('slot-1', DayOfWeek.Mon)],
    };
    (getSchedule as jest.Mock).mockResolvedValue(schedule);

    const { result } = renderHook(() => useSchedule(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(schedule);
    });
  });
});

describe('useTodaysSchedule', () => {
  it('fetches today once authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const queryClient = createTestQueryClient();
    const today = {
      dayOfWeek: DayOfWeek.Mon,
      timeZone: 'Europe/Stockholm',
      slots: [createSlot('slot-1', DayOfWeek.Mon)],
    };
    (getTodaysSchedule as jest.Mock).mockResolvedValue(today);

    const { result } = renderHook(() => useTodaysSchedule(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(today);
    });
  });
});

describe('useCreateSlots', () => {
  it('stores the returned schedule in the query cache', async () => {
    const queryClient = createTestQueryClient();
    const initialSchedule: Schedule = {
      timeZone: 'Europe/Stockholm',
      slots: [createSlot('slot-1', DayOfWeek.Mon)],
    };
    const nextSchedule: Schedule = {
      timeZone: 'Europe/Stockholm',
      slots: [
        createSlot('slot-1', DayOfWeek.Mon),
        createSlot('slot-2', DayOfWeek.Wed),
      ],
    };

    queryClient.setQueryData([QueryKey.Schedule], initialSchedule);
    (createSlots as jest.Mock).mockResolvedValue(nextSchedule);

    const { result } = renderHook(() => useCreateSlots(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
        slotTime: '08:00',
        mode: SlotMode.Manual,
      });
    });

    await waitFor(() => {
      expect(createSlots).toHaveBeenCalledWith({
        daysOfWeek: [DayOfWeek.Mon, DayOfWeek.Wed],
        slotTime: '08:00',
        mode: SlotMode.Manual,
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData([QueryKey.Schedule])).toEqual(
        nextSchedule,
      );
    });
  });
});

describe('schedule slot mutations', () => {
  it('adds a created slot to the schedule cache and invalidates today', async () => {
    const queryClient = createTestQueryClient();
    const slot = createSlot('slot-1', DayOfWeek.Tue);
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (createScheduleSlot as jest.Mock).mockResolvedValue(slot);

    const { result } = renderHook(() => useCreateSlot(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        dayOfWeek: DayOfWeek.Tue,
        slotTime: '08:00',
        mode: SlotMode.Manual,
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData([QueryKey.Schedule])).toEqual({
        timeZone: 'UTC',
        slots: [slot],
      });
    });
    expectTodaysScheduleInvalidated(queryClient);
  });

  it('stores schedules returned by preset application', async () => {
    const queryClient = createTestQueryClient();
    const schedule: Schedule = {
      timeZone: 'Europe/Stockholm',
      slots: [createSlot('slot-1', DayOfWeek.Mon)],
    };
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (applyEveryDayPreset as jest.Mock).mockResolvedValue(
      schedule,
    );

    const { result } = renderHook(() => useApplyPreset(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        preset: SchedulePreset.EveryDay,
        slotTime: '21:00',
        mode: SlotMode.AI,
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData([QueryKey.Schedule])).toEqual(schedule);
    });
    expectTodaysScheduleInvalidated(queryClient);
  });

  it('replaces updated slots in the schedule cache', async () => {
    const queryClient = createTestQueryClient();
    const original = createSlot('slot-1', DayOfWeek.Mon);
    const updated = {
      ...original,
      slotTime: '09:30',
    };
    queryClient.setQueryData([QueryKey.Schedule], {
      timeZone: 'Europe/Stockholm',
      slots: [original],
    });
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (updateSlot as jest.Mock).mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateSlot(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        id: original.id,
        payload: { slotTime: '09:30' },
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Schedule>([QueryKey.Schedule])?.slots).toEqual([
        updated,
      ]);
    });
    expectTodaysScheduleInvalidated(queryClient);
  });

  it('removes deleted slots from the schedule cache', async () => {
    const queryClient = createTestQueryClient();
    const deleted = createSlot('slot-1', DayOfWeek.Mon);
    const kept = createSlot('slot-2', DayOfWeek.Tue);
    queryClient.setQueryData([QueryKey.Schedule], {
      timeZone: 'Europe/Stockholm',
      slots: [deleted, kept],
    });
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (deleteSlot as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteSlot(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(deleted.id);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Schedule>([QueryKey.Schedule])?.slots).toEqual([
        kept,
      ]);
    });
    expectTodaysScheduleInvalidated(queryClient);
  });

  it('stores slots returned after routine step updates', async () => {
    const queryClient = createTestQueryClient();
    const original = createSlot('slot-1', DayOfWeek.Mon);
    const updated = {
      ...original,
      steps: [
        {
          ...original.steps[0],
          stepLabel: StepLabel.Serum,
        },
      ],
    };
    queryClient.setQueryData([QueryKey.Schedule], {
      timeZone: 'Europe/Stockholm',
      slots: [original],
    });
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (upsertSteps as jest.Mock).mockResolvedValue(updated);

    const { result } = renderHook(() => useUpsertSteps(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        id: original.id,
        payload: {
          steps: [
            {
              stepOrder: 0,
              inventoryProductId: null,
              stepLabel: StepLabel.Serum,
            },
          ],
        },
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Schedule>([QueryKey.Schedule])?.slots).toEqual([
        updated,
      ]);
    });
    expectTodaysScheduleInvalidated(queryClient);
  });

  it('stores moved slots in the schedule cache', async () => {
    const queryClient = createTestQueryClient();
    const original = createSlot('slot-1', DayOfWeek.Mon);
    const moved = {
      ...original,
      dayOfWeek: DayOfWeek.Wed,
    };
    queryClient.setQueryData([QueryKey.Schedule], {
      timeZone: 'Europe/Stockholm',
      slots: [original],
    });
    queryClient.setQueryData([QueryKey.ScheduleToday], { slots: [] });
    (moveSlot as jest.Mock).mockResolvedValue(moved);

    const { result } = renderHook(() => useMoveSlot(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        id: original.id,
        payload: { toDay: DayOfWeek.Wed, toTime: original.slotTime },
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Schedule>([QueryKey.Schedule])?.slots).toEqual([
        moved,
      ]);
    });
    expectTodaysScheduleInvalidated(queryClient);
  });
});
