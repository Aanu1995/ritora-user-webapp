'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryKey } from '@/constants/query-keys';
import * as scheduleService from '@/services/schedule.service';
import { useAuthStore } from '@/stores/auth-store';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [QueryKey.Schedule],
    queryFn: () => scheduleService.getSchedule(),
    enabled: isAuthenticated,
  });
}

export function useTodaysSchedule() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [QueryKey.ScheduleToday],
    queryFn: () => scheduleService.getTodaysSchedule(),
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotPayload) =>
      scheduleService.createSlot(payload),
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
      scheduleService.createSlots(payload),
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
      scheduleService.applyEveryDayPreset(payload),
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
      scheduleService.updateSlot(id, payload),
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
    mutationFn: (id: string) => scheduleService.deleteSlot(id),
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
    }) => scheduleService.upsertSteps(id, payload),
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
      scheduleService.moveSlot(id, payload),
    onSuccess: (slot) => {
      queryClient.setQueryData<Schedule>([QueryKey.Schedule], (prev) =>
        replaceSlotInSchedule(prev, slot),
      );
      invalidateTodaysScheduleQuery(queryClient);
    },
  });
}
