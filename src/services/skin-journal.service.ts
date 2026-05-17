import {
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

export async function getTodayEntry(): Promise<{
  date: string;
  entry: JournalEntry | null;
}> {
  return getRequest(ApiPath.SkinJournalToday);
}

export async function getCalendar(month: string): Promise<CalendarPayload> {
  const params = new URLSearchParams({ month });
  return getRequest(`${ApiPath.SkinJournalCalendar}?${params.toString()}`);
}

export async function getDay(date: string): Promise<DayDetail> {
  return getRequest(ApiPath.SkinJournalDay(date));
}

export async function listMonthEntries(month: string): Promise<JournalEntry[]> {
  const params = new URLSearchParams({ month });
  return getRequest(`${ApiPath.SkinJournalEntries}?${params.toString()}`);
}

export async function listPhotos(filters: {
  from?: string;
  to?: string;
  filter?: PhotoFilterId;
  limit?: number;
  cursor?: string | null;
}): Promise<PhotoPage> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.filter && filters.filter !== PhotoFilterStaticId.All) {
    params.append("filter", filters.filter);
  }
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.cursor) params.append("cursor", filters.cursor);
  const qs = params.toString();
  return getRequest(
    qs ? `${ApiPath.SkinJournalPhotos}?${qs}` : ApiPath.SkinJournalPhotos,
  );
}

export async function listPhotoFilters(filters: {
  from?: string;
  to?: string;
} = {}): Promise<PhotoFilterIndex> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const qs = params.toString();
  return getRequest(
    qs
      ? `${ApiPath.SkinJournalPhotoFilters}?${qs}`
      : ApiPath.SkinJournalPhotoFilters,
  );
}

export async function listPhotoDates(filters: {
  from?: string;
  to?: string;
} = {}): Promise<PhotoDateIndex> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const qs = params.toString();
  return getRequest(
    qs
      ? `${ApiPath.SkinJournalPhotoDates}?${qs}`
      : ApiPath.SkinJournalPhotoDates,
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
): Promise<CompareResponse> {
  const params = new URLSearchParams({ from, to });
  return getRequest(`${ApiPath.SkinJournalCompare}?${params.toString()}`);
}

export async function listEvents(
  filters: JournalEventFilters = {},
): Promise<JournalEvent[]> {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.acknowledged !== undefined) {
    params.set("acknowledged", String(filters.acknowledged));
  }
  const query = params.toString();
  return getRequest(
    query
      ? `${ApiPath.SkinJournalEvents}?${query}`
      : ApiPath.SkinJournalEvents,
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
): Promise<JournalInsightsResponse> {
  const query = buildInsightQuery(params);
  return getRequest(
    query
      ? `${ApiPath.SkinJournalInsights}?${query}`
      : ApiPath.SkinJournalInsights,
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

export async function listWrapped(): Promise<Wrapped[]> {
  return getRequest(ApiPath.SkinJournalWrappedList);
}

export async function getWrapped(id: string): Promise<Wrapped> {
  return getRequest(ApiPath.SkinJournalWrapped(id));
}

export async function getActiveSimplification(): Promise<SimplificationEvent | null> {
  return getRequest(ApiPath.SkinJournalSimplificationActive);
}

export async function getSimplification(
  id: string,
): Promise<SimplificationEvent> {
  return getRequest(ApiPath.SkinJournalSimplification(id));
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

export async function getJournalStats(): Promise<JournalStats> {
  return getRequest(ApiPath.SkinJournalStats);
}

export async function createJournalExport(payload: {
  from: string;
  to: string;
}): Promise<JournalExportJob> {
  return postRequest(ApiPath.SkinJournalExport, payload);
}

export async function getJournalExport(id: string): Promise<JournalExportJob> {
  return getRequest(ApiPath.SkinJournalExportJob(id));
}
