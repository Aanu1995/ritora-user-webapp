'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDeviceTimeZone } from '@/hooks/use-device-time-zone';
import {
  millisecondsUntilNextShelfDay,
  resolveShelfToday,
} from '@/lib/shelf-date';
import { resolveTimeZoneContext } from '@/lib/time-zone';
import { useAuthStore } from '@/stores/auth-store';

export type ShelfDateContext = {
  timeZone: string;
  todayDate: string;
};

function resolveTodayDate(timeZone: string): string {
  return resolveShelfToday(timeZone).toString();
}

export function useShelfDateContext(): ShelfDateContext {
  const savedTimeZone = useAuthStore((state) => state.user?.timeZone ?? null);
  const deviceTimeZone = useDeviceTimeZone();
  const timeZone = resolveTimeZoneContext(savedTimeZone, deviceTimeZone).timeZone;
  const [todayDate, setTodayDate] = useState(() => resolveTodayDate(timeZone));

  useEffect(() => {
    let timeoutId: number | null = null;

    const refreshTodayDate = () => {
      const nextTodayDate = resolveTodayDate(timeZone);
      setTodayDate((currentTodayDate) =>
        currentTodayDate === nextTodayDate ? currentTodayDate : nextTodayDate,
      );
    };
    const scheduleNextRefresh = () => {
      timeoutId = window.setTimeout(() => {
        refreshTodayDate();
        scheduleNextRefresh();
      }, millisecondsUntilNextShelfDay(timeZone));
    };
    const refreshAndReschedule = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      refreshTodayDate();
      scheduleNextRefresh();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAndReschedule();
      }
    };

    refreshAndReschedule();

    window.addEventListener('focus', refreshAndReschedule);
    window.addEventListener('pageshow', refreshAndReschedule);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener('focus', refreshAndReschedule);
      window.removeEventListener('pageshow', refreshAndReschedule);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeZone]);

  return useMemo(
    () => ({
      timeZone,
      todayDate,
    }),
    [timeZone, todayDate],
  );
}

export function useShelfTimeZone(): string {
  return useShelfDateContext().timeZone;
}
