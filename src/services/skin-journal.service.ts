import {
  type ApiRequestOptions,
  deleteRequest,
  getRequest,
  patchRequest,
  postMultipartRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import {
  PhotoFilterStaticId,
  type Angle,
  type CalendarPayload,
  type CompareResponse,
  type DayDetail,
  type JournalEntry,
  type JournalEvent,
  type JournalEventFilters,
  type JournalExportJob,
  type InsightAction,
  type JournalInsightsResponse,
  type InsightWindow,
  type JournalStats,
  type PhotoDateIndex,
  type PhotoFilterId,
  type PhotoFilterIndex,
  type PhotoPage,
  type Wrapped,
  type SimplificationEvent,
  type UpsertEntryPayload,
} from "@/types/skin-journal";
import type { UploadProgressOptions } from "@/lib/upload-progress";

export type PhotoAngleUpload = Partial<Record<Angle, File>>;

function buildEntryFormData(
  payload: UpsertEntryPayload,
  photos?: PhotoAngleUpload | null,
): FormData {
  const fd = new FormData();
  if (photos) {
    const fieldByAngle: Record<Angle, string> = {
      head_on: "photo_head_on",
      left_profile: "photo_left_profile",
      right_profile: "photo_right_profile",
    };
    for (const [angle, file] of Object.entries(photos) as Array<
      [Angle, unknown]
    >) {
      const fieldName = fieldByAngle[angle];
      if (fieldName && file instanceof File) {
        fd.append(fieldName, file);
      }
    }
  }
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === null) {
      fd.append(key, "");
      continue;
    }
    if (typeof value === "object") {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getTodayEntry(
  options?: ApiRequestOptions,
): Promise<{
  date: string;
  entry: JournalEntry | null;
}> {
  return getWithOptions<{
    date: string;
    entry: JournalEntry | null;
  }>(ApiPath.SkinJournalToday, options);
}

export async function getCalendar(
  month: string,
  options?: ApiRequestOptions,
): Promise<CalendarPayload> {
  const params = new URLSearchParams({ month });
  return getWithOptions<CalendarPayload>(
    `${ApiPath.SkinJournalCalendar}?${params.toString()}`,
    options,
  );
}

export async function getDay(
  date: string,
  options?: ApiRequestOptions,
): Promise<DayDetail> {
  return getWithOptions<DayDetail>(ApiPath.SkinJournalDay(date), options);
}

export async function listMonthEntries(
  month: string,
  options?: ApiRequestOptions,
): Promise<JournalEntry[]> {
  const params = new URLSearchParams({ month });
  return getWithOptions<JournalEntry[]>(
    `${ApiPath.SkinJournalEntries}?${params.toString()}`,
    options,
  );
}

export async function listPhotos(filters: {
  from?: string;
  to?: string;
  filter?: PhotoFilterId;
  limit?: number;
  cursor?: string | null;
}, options?: ApiRequestOptions): Promise<PhotoPage> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.filter && filters.filter !== PhotoFilterStaticId.All) {
    params.append("filter", filters.filter);
  }
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.cursor) params.append("cursor", filters.cursor);
  const qs = params.toString();
  return getWithOptions<PhotoPage>(
    qs ? `${ApiPath.SkinJournalPhotos}?${qs}` : ApiPath.SkinJournalPhotos,
    options,
  );
}

export async function listPhotoFilters(filters: {
  from?: string;
  to?: string;
} = {}, options?: ApiRequestOptions): Promise<PhotoFilterIndex> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const qs = params.toString();
  return getWithOptions<PhotoFilterIndex>(
    qs
      ? `${ApiPath.SkinJournalPhotoFilters}?${qs}`
      : ApiPath.SkinJournalPhotoFilters,
    options,
  );
}

export async function listPhotoDates(filters: {
  from?: string;
  to?: string;
} = {}, options?: ApiRequestOptions): Promise<PhotoDateIndex> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const qs = params.toString();
  return getWithOptions<PhotoDateIndex>(
    qs
      ? `${ApiPath.SkinJournalPhotoDates}?${qs}`
      : ApiPath.SkinJournalPhotoDates,
    options,
  );
}

export async function upsertToday(
  payload: UpsertEntryPayload,
  photos?: PhotoAngleUpload | null,
  options: UploadProgressOptions = {},
): Promise<JournalEntry> {
  const config = options.onUploadProgress
    ? { onUploadProgress: options.onUploadProgress }
    : undefined;

  return postMultipartRequest(
    ApiPath.SkinJournalToday,
    buildEntryFormData(payload, photos),
    config,
  );
}

export async function updateEntry(
  id: string,
  payload: UpsertEntryPayload,
): Promise<JournalEntry> {
  return patchRequest(ApiPath.SkinJournalEntry(id), payload);
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteRequest<unknown>(ApiPath.SkinJournalEntry(id));
}

export async function retryAnalysis(id: string): Promise<JournalEntry> {
  return postRequest(ApiPath.SkinJournalEntryRetry(id), {});
}

export async function compareDays(
  from: string,
  to: string,
  options?: ApiRequestOptions,
): Promise<CompareResponse> {
  const params = new URLSearchParams({ from, to });
  return getWithOptions<CompareResponse>(
    `${ApiPath.SkinJournalCompare}?${params.toString()}`,
    options,
  );
}

export async function listEvents(
  filters: JournalEventFilters = {},
  options?: ApiRequestOptions,
): Promise<JournalEvent[]> {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.acknowledged !== undefined) {
    params.set("acknowledged", String(filters.acknowledged));
  }
  const query = params.toString();
  return getWithOptions<JournalEvent[]>(
    query
      ? `${ApiPath.SkinJournalEvents}?${query}`
      : ApiPath.SkinJournalEvents,
    options,
  );
}

export async function acknowledgeEvent(id: string): Promise<JournalEvent> {
  return postRequest(ApiPath.SkinJournalEventAck(id), {});
}

interface InsightListParams {
  window?: InsightWindow;
  locale?: string;
}

function buildInsightQuery(params: InsightListParams = {}): string {
  const query = new URLSearchParams();
  if (params.window) query.set("window", params.window);
  if (params.locale) query.set("locale", params.locale);
  return query.toString();
}

export async function listInsights(
  params: InsightListParams = {},
  options?: ApiRequestOptions,
): Promise<JournalInsightsResponse> {
  const query = buildInsightQuery(params);
  return getWithOptions<JournalInsightsResponse>(
    query
      ? `${ApiPath.SkinJournalInsights}?${query}`
      : ApiPath.SkinJournalInsights,
    options,
  );
}

export async function dismissInsight(id: string): Promise<void> {
  await postRequest<unknown>(ApiPath.SkinJournalInsightDismiss(id), {});
}

export async function markInsightSeen(id: string): Promise<void> {
  await postRequest<unknown>(ApiPath.SkinJournalInsightSeen(id), {});
}

export async function recordInsightAction(
  id: string,
  payload: { action_kind: InsightAction["kind"] },
): Promise<void> {
  await postRequest<unknown>(ApiPath.SkinJournalInsightInteractions(id), payload);
}

export async function listWrapped(
  options?: ApiRequestOptions,
): Promise<Wrapped[]> {
  return getWithOptions<Wrapped[]>(ApiPath.SkinJournalWrappedList, options);
}

export async function getWrapped(
  id: string,
  options?: ApiRequestOptions,
): Promise<Wrapped> {
  return getWithOptions<Wrapped>(ApiPath.SkinJournalWrapped(id), options);
}

export async function getActiveSimplification(
  options?: ApiRequestOptions,
): Promise<SimplificationEvent | null> {
  return getWithOptions<SimplificationEvent | null>(
    ApiPath.SkinJournalSimplificationActive,
    options,
  );
}

export async function getSimplification(
  id: string,
  options?: ApiRequestOptions,
): Promise<SimplificationEvent> {
  return getWithOptions<SimplificationEvent>(
    ApiPath.SkinJournalSimplification(id),
    options,
  );
}

export async function startSimplification(payload: {
  triggered_by_event_id?: string | null;
  reason?: string;
}): Promise<SimplificationEvent> {
  return postRequest(ApiPath.SkinJournalSimplificationStart, payload);
}

export async function acknowledgeSimplification(
  id: string,
): Promise<SimplificationEvent> {
  return postRequest(ApiPath.SkinJournalSimplificationAck(id), {});
}

export async function getJournalStats(
  options?: ApiRequestOptions,
): Promise<JournalStats> {
  return getWithOptions<JournalStats>(ApiPath.SkinJournalStats, options);
}

export async function createJournalExport(payload: {
  from: string;
  to: string;
}): Promise<JournalExportJob> {
  return postRequest(ApiPath.SkinJournalExport, payload);
}

export async function getJournalExport(
  id: string,
  options?: ApiRequestOptions,
): Promise<JournalExportJob> {
  return getWithOptions<JournalExportJob>(
    ApiPath.SkinJournalExportJob(id),
    options,
  );
}
