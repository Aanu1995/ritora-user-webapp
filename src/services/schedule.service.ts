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

export async function getSchedule(): Promise<Schedule> {
  return getRequest<Schedule>(ApiPath.Schedule);
}

export async function getTodaysSchedule(): Promise<TodaysSchedule> {
  return getRequest<TodaysSchedule>(ApiPath.ScheduleToday);
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
  return patchRequest<ScheduleSlot>(ApiPath.ScheduleSlot(id), payload);
}

export async function deleteSlot(id: string): Promise<void> {
  return deleteRequest<void>(ApiPath.ScheduleSlot(id));
}

export async function upsertSteps(
  id: string,
  payload: UpsertRoutineStepsPayload,
): Promise<ScheduleSlot> {
  return putRequest<ScheduleSlot>(ApiPath.ScheduleSlotSteps(id), payload);
}

export async function moveSlot(
  id: string,
  payload: MoveSlotPayload,
): Promise<ScheduleSlot> {
  return postRequest<ScheduleSlot>(ApiPath.ScheduleSlotMove(id), payload);
}
