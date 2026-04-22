'use client';

import { Profiler, type ReactNode } from 'react';
import {
  isScheduleProfilingEnabled,
  onScheduleProfilerRender,
} from '@/lib/schedule-performance';

type ScheduleRenderProfilerProps = {
  id: string;
  children: ReactNode;
};

export function ScheduleRenderProfiler({
  id,
  children,
}: ScheduleRenderProfilerProps) {
  if (!isScheduleProfilingEnabled()) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onScheduleProfilerRender}>
      {children}
    </Profiler>
  );
}
