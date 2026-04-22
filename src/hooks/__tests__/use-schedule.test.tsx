import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryKey } from '@/constants/query-keys';
import {
  DayOfWeek,
  SlotMode,
  StepLabel,
  type Schedule,
  type ScheduleSlot,
} from '@/types/schedule';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateSlots, useSchedule } from '@/hooks/use-schedule';

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

import * as scheduleService from '@/services/schedule.service';

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
        product: null,
        createdAt: '2026-04-17T00:00:00.000Z',
        updatedAt: '2026-04-17T00:00:00.000Z',
      },
    ],
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
  };
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
    (scheduleService.createSlots as jest.Mock).mockResolvedValue(nextSchedule);

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
      expect(scheduleService.createSlots).toHaveBeenCalledWith({
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
