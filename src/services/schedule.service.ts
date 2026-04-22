import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '@/lib/api';
import { ApiPath } from '@/constants/api-paths';
import type {
  ApplyPresetPayload,
  CreateSlotPayload,
  CreateSlotsPayload,
  MoveSlotPayload,
  Schedule,
  ScheduleSlot,
  TodaysSchedule,
  UpdateSlotPayload,
  UpsertRoutineStepsPayload,
} from '@/types/schedule';

function getClientTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export async function getSchedule(): Promise<Schedule> {
  return getRequest<Schedule>(ApiPath.Schedule);
}

export async function getTodaysSchedule(): Promise<TodaysSchedule> {
  const timezone = getClientTimezone();
  return getRequest<TodaysSchedule>(ApiPath.ScheduleToday, {
    headers: timezone ? { 'x-timezone': timezone } : undefined,
  });
}

export async function createSlot(
  payload: CreateSlotPayload,
): Promise<ScheduleSlot> {
  return postRequest<ScheduleSlot>(ApiPath.ScheduleSlots, payload);
}

export async function createSlots(
  payload: CreateSlotsPayload,
): Promise<Schedule> {
  return postRequest<Schedule>(ApiPath.ScheduleSlotsBatch, payload);
}

export async function applyEveryDayPreset(
  payload: ApplyPresetPayload,
): Promise<Schedule> {
  return postRequest<Schedule>(ApiPath.ScheduleApplyPreset, payload);
}

export async function updateSlot(
  id: string,
  payload: UpdateSlotPayload,
): Promise<ScheduleSlot> {
  return patchRequest<ScheduleSlot>(`${ApiPath.ScheduleSlots}/${id}`, payload);
}

export async function deleteSlot(id: string): Promise<void> {
  return deleteRequest<void>(`${ApiPath.ScheduleSlots}/${id}`);
}

export async function upsertSteps(
  id: string,
  payload: UpsertRoutineStepsPayload,
): Promise<ScheduleSlot> {
  return putRequest<ScheduleSlot>(
    `${ApiPath.ScheduleSlots}/${id}/steps`,
    payload,
  );
}

export async function moveSlot(
  id: string,
  payload: MoveSlotPayload,
): Promise<ScheduleSlot> {
  return postRequest<ScheduleSlot>(
    `${ApiPath.ScheduleSlots}/${id}/move`,
    payload,
  );
}
