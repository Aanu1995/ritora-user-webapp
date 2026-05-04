import { getRequest, postRequest } from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  RegenerateSuggestionPayload,
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

export async function getSuggestionHistory(
  query: SuggestionHistoryListQuery = {},
): Promise<SuggestionHistoryListResponse> {
  const params = new URLSearchParams();
  if (query.range) params.set("range", query.range);
  if (query.fromDate) params.set("from", query.fromDate);
  if (query.toDate) params.set("to", query.toDate);
  if (query.daypart) params.set("daypart", query.daypart);
  if (query.status) params.set("status", query.status);
  if (query.hasBeenEdited !== undefined) {
    params.set("edited", String(query.hasBeenEdited));
  }
  if (query.cursor) params.set("cursor", query.cursor);
  const qs = params.toString();
  const path = qs
    ? `${ApiPath.SuggestionsHistory}?${qs}`
    : ApiPath.SuggestionsHistory;
  return getRequest<SuggestionHistoryListResponse>(path);
}

export async function getSuggestionHistoryDay(
  date: string,
): Promise<SuggestionHistoryDay> {
  return getRequest<SuggestionHistoryDay>(ApiPath.SuggestionsHistoryDay(date));
}
