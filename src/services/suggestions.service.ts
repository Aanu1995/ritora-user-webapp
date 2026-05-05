import { getRequest, postRequest } from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  NormalRoutineOverrideResponse,
  RecordingReminderSnoozeResponse,
  RecordSuggestionGapActionPayload,
  RegenerateSuggestionPayload,
  SnoozeRecordingReminderPayload,
  SuggestionGapActionResponse,
  SuggestionHistoryDay,
  SuggestionHistoryListQuery,
  SuggestionHistoryListResponse,
  SuggestionInstance,
  TodaysSuggestionResponse,
} from "@/types/suggestions";

export async function getTodaysSuggestion(): Promise<TodaysSuggestionResponse> {
  return getRequest<TodaysSuggestionResponse>(ApiPath.SuggestionsToday);
}

export async function getSuggestion(id: string): Promise<SuggestionInstance> {
  return getRequest<SuggestionInstance>(ApiPath.Suggestion(id));
}

export async function regenerateSuggestion(
  id: string,
  payload: RegenerateSuggestionPayload = {},
): Promise<SuggestionInstance> {
  return postRequest<SuggestionInstance>(
    ApiPath.SuggestionRegenerate(id),
    payload,
  );
}

export async function useNormalRoutineForToday(): Promise<NormalRoutineOverrideResponse> {
  return postRequest<NormalRoutineOverrideResponse>(
    ApiPath.SuggestionsTodayNormalRoutine,
    {},
  );
}

export async function recordSuggestionGapAction(
  payload: RecordSuggestionGapActionPayload,
): Promise<SuggestionGapActionResponse> {
  return postRequest<SuggestionGapActionResponse>(
    ApiPath.SuggestionGapActions,
    payload,
  );
}

export async function snoozeRecordingReminder(
  payload: SnoozeRecordingReminderPayload,
): Promise<RecordingReminderSnoozeResponse> {
  return postRequest<RecordingReminderSnoozeResponse>(
    ApiPath.SuggestionsTodayReminderLater,
    payload,
  );
}

export async function getSuggestionHistory(
  query: SuggestionHistoryListQuery = {},
): Promise<SuggestionHistoryListResponse> {
  return getRequest<SuggestionHistoryListResponse>(
    buildSuggestionHistoryPath(ApiPath.SuggestionsHistory, query, true),
  );
}

export async function exportSuggestionHistoryCsv(
  query: SuggestionHistoryListQuery = {},
): Promise<Blob> {
  return getRequest<Blob>(
    buildSuggestionHistoryPath(ApiPath.SuggestionsHistoryExport, query, false),
    {
      headers: { Accept: "text/csv" },
      responseType: "blob",
    },
  );
}

function buildSuggestionHistoryPath(
  basePath: string,
  query: SuggestionHistoryListQuery,
  includePagination: boolean,
): string {
  const params = new URLSearchParams();
  if (query.range) params.set("range", query.range);
  if (query.fromDate) params.set("from", query.fromDate);
  if (query.toDate) params.set("to", query.toDate);
  if (query.daypart) params.set("daypart", query.daypart);
  if (query.mode) params.set("mode", query.mode);
  if (query.status) params.set("status", query.status);
  if (query.hasBeenEdited !== undefined) {
    params.set("edited", String(query.hasBeenEdited));
  }
  if (includePagination && query.cursor) params.set("cursor", query.cursor);
  if (includePagination && query.limit)
    params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function getSuggestionHistoryDay(
  date: string,
): Promise<SuggestionHistoryDay> {
  return getRequest<SuggestionHistoryDay>(ApiPath.SuggestionsHistoryDay(date));
}
