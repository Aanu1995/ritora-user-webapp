"use client";

import { useMemo } from "react";
import { RoutineMemoryPanel } from "@/components/skin-journal/routine-memory-panel";
import { useRoutineMemory } from "@/hooks/use-skin-journal";
import { useJournalUiStore } from "@/stores/journal-ui-store";
import type { RoutineMemoryDurationDays } from "@/types/routine-memory";

interface RoutineMemoryWindowFilter {
  from: string;
  to: string;
}

export function RoutineMemoryTab() {
  const durationDays = useJournalUiStore(
    (state) => state.routineMemoryDurationDays,
  );
  const setDurationDays = useJournalUiStore(
    (state) => state.setRoutineMemoryDurationDays,
  );
  const filters = useMemo(
    () => resolveDurationWindow(durationDays),
    [durationDays],
  );
  const { data, isLoading } = useRoutineMemory(filters);

  return (
    <RoutineMemoryPanel
      data={data ?? null}
      durationDays={durationDays}
      isLoading={isLoading}
      onDurationDaysChange={setDurationDays}
    />
  );
}

function resolveDurationWindow(
  days: RoutineMemoryDurationDays,
): RoutineMemoryWindowFilter {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return {
    from: formatLocalYmd(start),
    to: formatLocalYmd(end),
  };
}

function formatLocalYmd(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
