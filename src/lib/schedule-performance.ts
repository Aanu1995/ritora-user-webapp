import type { ProfilerOnRenderCallback } from 'react';

export const SCHEDULE_PROFILING_STORAGE_KEY = 'ritora.schedule.profiling';
export const MAX_SCHEDULE_PROFILE_EVENTS = 200;
export const SLOW_SCHEDULE_RENDER_MS = 8;

export type ScheduleProfileEvent = {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
};

declare global {
  interface Window {
    __RITORA_SCHEDULE_PROFILE_EVENTS__?: ScheduleProfileEvent[];
  }
}

function getScheduleProfileStore(): ScheduleProfileEvent[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window.__RITORA_SCHEDULE_PROFILE_EVENTS__) {
    window.__RITORA_SCHEDULE_PROFILE_EVENTS__ = [];
  }

  return window.__RITORA_SCHEDULE_PROFILE_EVENTS__;
}

export function isScheduleProfilingEnabled(): boolean {
  if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(SCHEDULE_PROFILING_STORAGE_KEY) === '1'
    );
  } catch {
    return false;
  }
}

export function recordScheduleProfileEvent(
  event: ScheduleProfileEvent,
): void {
  const store = getScheduleProfileStore();
  if (!store) {
    return;
  }

  store.push(event);

  if (store.length > MAX_SCHEDULE_PROFILE_EVENTS) {
    store.splice(0, store.length - MAX_SCHEDULE_PROFILE_EVENTS);
  }

  if (event.actualDuration >= SLOW_SCHEDULE_RENDER_MS) {
    console.info(
      `[Ritora][Schedule Profiler] ${event.id} ${event.phase} render took ${event.actualDuration.toFixed(2)}ms (base ${event.baseDuration.toFixed(2)}ms)`,
    );
  }
}

export function clearScheduleProfileEvents(): void {
  const store = getScheduleProfileStore();
  if (!store) {
    return;
  }

  store.length = 0;
}

export const onScheduleProfilerRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (!isScheduleProfilingEnabled()) {
    return;
  }

  recordScheduleProfileEvent({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
};
