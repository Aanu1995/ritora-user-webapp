import type {
  AnalysisStatus,
  CalendarPayload,
  DayDetail,
  JournalEntry,
  JournalInsightsResponse,
} from "@/types/skin-journal";

export const JOURNAL_ANALYSIS_POLL_INTERVAL_MS = 5000;
export const JOURNAL_INSIGHT_POLL_INTERVAL_MS = 5000;

const ACTIVE_ANALYSIS_STATUSES = new Set<AnalysisStatus>([
  "pending",
  "queued",
  "running",
]);

export function hasActiveAnalysisStatus(
  status: AnalysisStatus | null | undefined,
): boolean {
  return !!status && ACTIVE_ANALYSIS_STATUSES.has(status);
}

export function shouldPollCalendar(
  payload: CalendarPayload | undefined,
): boolean {
  return payload?.days.some((day) =>
    hasActiveAnalysisStatus(day.analysis_status),
  ) ?? false;
}

export function shouldPollDay(detail: DayDetail | null | undefined): boolean {
  return hasActiveAnalysisStatus(detail?.entry?.analysis_status);
}

export function shouldPollTodayEntry(
  payload:
    | {
        entry: Pick<JournalEntry, "analysis_status"> | null;
      }
    | null
    | undefined,
): boolean {
  return hasActiveAnalysisStatus(payload?.entry?.analysis_status);
}

export function shouldPollInsights(
  payload: JournalInsightsResponse | undefined,
): boolean {
  return (
    payload?.meta.generation_status === "queued" ||
    payload?.meta.generation_status === "sent" ||
    payload?.meta.generation_status === "running"
  );
}
