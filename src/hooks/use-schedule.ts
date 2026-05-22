'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryKey } from '@/constants/query-keys';
import { useAuthEnabled } from '@/hooks/use-auth-enabled';
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
import type {
  ApplyPresetPayload,
  CreateSlotPayload,
  CreateSlotsPayload,
  MoveSlotPayload,
  Schedule,
  ScheduleSlot,
  UpdateSlotPayload,
  UpsertRoutineStepsPayload,
} from '@/types/schedule';

function invalidateTodaysScheduleQuery(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.ScheduleToday] });
}

function replaceSlotInSchedule(
  schedule: Schedule | undefined,
  slot: ScheduleSlot,
): Schedule {
  const slots = schedule?.slots ?? [];
  const index = slots.findIndex((s) => s.id === slot.id);
  const nextSlots =
    index >= 0
      ? [...slots.slice(0, index), slot, ...slots.slice(index + 1)]
      : [...slots, slot];
  return {
    timeZone: schedule?.timeZone ?? 'UTC',
    slots: nextSlots,
  };
}

function removeSlotFromSchedule(
  schedule: Schedule | undefined,
  slotId: string,
): Schedule {
  return {
    timeZone: schedule?.timeZone ?? 'UTC',
    slots: (schedule?.slots ?? []).filter((s) => s.id !== slotId),
  };
}

export function useSchedule() {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.Schedule],
    queryFn: ({ signal }) => getSchedule({ signal }),
    enabled: isEnabled,
  });
}

export function useTodaysSchedule() {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.ScheduleToday],
    queryFn: ({ signal }) => getTodaysSchedule({ signal }),
    enabled: isEnabled,
    refetchOnWindowFocus: true,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotPayload) =>
      createSlot(payload),
    onSuccess: (slot) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        replaceSlotInSchedule(prev, slot),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useCreateSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotsPayload) =>
      createSlots(payload),
    onSuccess: (schedule) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], schedule);
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useApplyPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyPresetPayload) =>
      applyEveryDayPreset(payload),
    onSuccess: (schedule) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], schedule);
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSlotPayload }) =>
      updateSlot(id, payload),
    onSuccess: (slot) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        replaceSlotInSchedule(prev, slot),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        removeSlotFromSchedule(prev, id),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useUpsertSteps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpsertRoutineStepsPayload;
    }) => upsertSteps(id, payload),
    onSuccess: (slot) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        replaceSlotInSchedule(prev, slot),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}

export function useMoveSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MoveSlotPayload }) =>
      moveSlot(id, payload),
    onSuccess: (slot) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        replaceSlotInSchedule(prev, slot),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}
