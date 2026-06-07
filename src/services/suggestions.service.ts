import {
  type ApiRequestOptions,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  CreateOnDemandSuggestionPayload,
  NormalRoutineOverrideResponse,
  RecordingReminderSnoozeResponse,
  RecordSuggestionGapActionPayload,
  RegenerateSuggestionPayload,
  SnoozeRecordingReminderPayload,
  RoutineBreakState,
  SuggestionAiConsent,
  SuggestionGapActionResponse,
  SuggestionHistoryDay,
  SuggestionHistoryListQuery,
  SuggestionHistoryListResponse,
  SuggestionInstance,
  StartRoutineBreakPayload,
  TodaysSuggestionResponse,
  UpdateSuggestionAiConsentPayload,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getTodaysSuggestion(
  options?: ApiRequestOptions,
): Promise<TodaysSuggestionResponse> {
  return getWithOptions<TodaysSuggestionResponse>(
    ApiPath.SuggestionsToday,
    options,
  );
}

export async function getSuggestion(
  id: string,
  options?: ApiRequestOptions,
): Promise<SuggestionInstance> {
  return getWithOptions<SuggestionInstance>(ApiPath.Suggestion(id), options);
}

export async function createOnDemandSuggestion(
  payload: CreateOnDemandSuggestionPayload,
): Promise<SuggestionInstance> {
  return postRequest<SuggestionInstance>(ApiPath.SuggestionsOnDemand, payload);
}

export async function getSuggestionAiConsent(
  options?: ApiRequestOptions,
): Promise<SuggestionAiConsent> {
  return getWithOptions<SuggestionAiConsent>(
    ApiPath.SuggestionsAiConsent,
    options,
  );
}

export async function updateSuggestionAiConsent(
  payload: UpdateSuggestionAiConsentPayload,
): Promise<SuggestionAiConsent> {
  return postRequest<SuggestionAiConsent>(
    ApiPath.SuggestionsAiConsent,
    payload,
  );
}

export async function retryOnDemandSuggestion(
  id: string,
): Promise<SuggestionInstance> {
  return postRequest<SuggestionInstance>(ApiPath.SuggestionOnDemandRetry(id), {});
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

export async function getRoutineBreak(
  options?: ApiRequestOptions,
): Promise<RoutineBreakState> {
  return getWithOptions<RoutineBreakState>(
    ApiPath.SuggestionsBreak,
    options,
  );
}

export async function startRoutineBreak(
  payload: StartRoutineBreakPayload = {},
): Promise<RoutineBreakState> {
  return postRequest<RoutineBreakState>(ApiPath.SuggestionsBreak, payload);
}

export async function resumeRoutineBreak(): Promise<RoutineBreakState> {
  return postRequest<RoutineBreakState>(ApiPath.SuggestionsBreakResume, {});
}

export async function updateRoutineBreak(
  id: string,
  payload: UpdateRoutineBreakPayload,
): Promise<RoutineBreakState> {
  return patchRequest<RoutineBreakState>(ApiPath.SuggestionBreak(id), payload);
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
  options?: ApiRequestOptions,
): Promise<SuggestionHistoryListResponse> {
  return getWithOptions<SuggestionHistoryListResponse>(
    buildSuggestionHistoryPath(ApiPath.SuggestionsHistory, query),
    options,
  );
}

function buildSuggestionHistoryPath(
  basePath: string,
  query: SuggestionHistoryListQuery,
): string {
  const params = new URLSearchParams();
  if (query.range) params.set("range", query.range);
  if (query.fromDate) params.set("from", query.fromDate);
  if (query.toDate) params.set("to", query.toDate);
  if (query.daypart) params.set("daypart", query.daypart);
  if (query.mode) params.set("mode", query.mode);
  if (query.requestSource) params.set("requestSource", query.requestSource);
  if (query.status) params.set("status", query.status);
  if (query.hasBeenEdited !== undefined) {
    params.set("edited", String(query.hasBeenEdited));
  }
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function getSuggestionHistoryDay(
  date: string,
  options?: ApiRequestOptions,
): Promise<SuggestionHistoryDay> {
  return getWithOptions<SuggestionHistoryDay>(
    ApiPath.SuggestionsHistoryDay(date),
    options,
  );
}
