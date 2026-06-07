import { useMutation, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { invalidateAppNavBadges } from "@/lib/query-invalidation";
import * as journalService from "@/services/skin-journal.service";
import {
  AnalysisFeedbackReason,
  AnalysisFeedbackVote,
  PhotoAnalysisInterpretationVersion,
  PhotoAnalysisReadingLabel,
} from "@/types/skin-journal";
import {
  useAcknowledgeEvent,
  useAcknowledgeSimplification,
  useActiveSimplification,
  useCalendar,
  useCompareDays,
  useDay,
  useDeleteEntry,
  useDismissInsight,
  useEvents,
  useInsights,
  useJournalStats,
  useMarkInsightSeen,
  useMonthEntries,
  usePhotoDates,
  usePhotoFilters,
  usePhotos,
  useRecordAnalysisFeedback,
  useRecordInsightAction,
  useReinterpretAnalysis,
  useRetryAnalysis,
  useSimplification,
  useStartSimplification,
  useTodayEntry,
  useUpdateEntry,
  useUpsertToday,
  useWrapped,
  useWrappedList,
} from "@/hooks/use-skin-journal";

const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
};

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: jest.fn((options: unknown) => options),
  useMutation: jest.fn((options: unknown) => options),
  useQuery: jest.fn((options: unknown) => options),
  useQueryClient: jest.fn(() => mockQueryClient),
}));

jest.mock("@/hooks/use-auth-enabled", () => ({
  useAuthEnabled: jest.fn(() => true),
}));

jest.mock("@/lib/query-invalidation", () => ({
  invalidateAppNavBadges: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "upload-toast"),
    dismiss: jest.fn(),
  },
}));

jest.mock("@/services/skin-journal.service", () => ({
  acknowledgeEvent: jest.fn(),
  acknowledgeSimplification: jest.fn(),
  compareDays: jest.fn(),
  deleteEntry: jest.fn(),
  dismissInsight: jest.fn(),
  getActiveSimplification: jest.fn(),
  getCalendar: jest.fn(),
  getDay: jest.fn(),
  getJournalStats: jest.fn(),
  getSimplification: jest.fn(),
  getTodayEntry: jest.fn(),
  getWrapped: jest.fn(),
  listEvents: jest.fn(),
  listInsights: jest.fn(),
  listMonthEntries: jest.fn(),
  listPhotoDates: jest.fn(),
  listPhotoFilters: jest.fn(),
  listPhotos: jest.fn(),
  listWrapped: jest.fn(),
  markInsightSeen: jest.fn(),
  recordInsightAction: jest.fn(),
  recordAnalysisFeedback: jest.fn(),
  reinterpretAnalysis: jest.fn(),
  retryAnalysis: jest.fn(),
  startSimplification: jest.fn(),
  updateEntry: jest.fn(),
  upsertToday: jest.fn(),
}));

type QueryOptions = {
  queryKey: readonly unknown[];
  queryFn: (context: { signal: AbortSignal }) => unknown;
  enabled?: boolean;
  refetchInterval?: (query: { state: { data: unknown } }) => number | false;
};

type InfiniteQueryOptions = {
  queryKey: readonly unknown[];
  queryFn: (context: {
    pageParam: string | null;
    signal: AbortSignal;
  }) => unknown;
  getNextPageParam: (page: { nextCursor: string | null }) => string | null;
};

type MutationOptions<TInput, TResult = unknown> = {
  mutationFn: (input: TInput) => unknown;
  onSuccess?: (result: TResult, variables: TInput) => void;
};

function asQuery(value: unknown): QueryOptions {
  return value as QueryOptions;
}

function asInfinite(value: unknown): InfiniteQueryOptions {
  return value as InfiniteQueryOptions;
}

function asMutation<TInput, TResult = unknown>(
  value: unknown,
): MutationOptions<TInput, TResult> {
  return value as MutationOptions<TInput, TResult>;
}

function queryContext() {
  return { signal: new AbortController().signal };
}

describe("useSkinJournal hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("wires read queries to the Skin Journal service layer", () => {
    asQuery(useTodayEntry()).queryFn(queryContext());
    asQuery(useCalendar("2026-05")).queryFn(queryContext());
    asQuery(useDay("2026-05-02")).queryFn(queryContext());
    asQuery(useMonthEntries("2026-05")).queryFn(queryContext());
    asQuery(usePhotoFilters({ from: "2026-05-01" })).queryFn(queryContext());
    asQuery(usePhotoDates({ to: "2026-05-31" })).queryFn(queryContext());
    asQuery(useCompareDays("2026-05-01", "2026-05-02")).queryFn(
      queryContext(),
    );
    asQuery(useEvents({ acknowledged: false })).queryFn(queryContext());
    asQuery(useInsights({ window: "month", locale: "sv" })).queryFn(
      queryContext(),
    );
    asQuery(useWrappedList()).queryFn(queryContext());
    asQuery(useWrapped("wrapped-1")).queryFn(queryContext());
    asQuery(useActiveSimplification()).queryFn(queryContext());
    asQuery(useSimplification("simplification-1")).queryFn(queryContext());
    asQuery(useJournalStats()).queryFn(queryContext());
    expect(journalService.getTodayEntry).toHaveBeenCalledWith(
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.getCalendar).toHaveBeenCalledWith(
      "2026-05",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.getDay).toHaveBeenCalledWith(
      "2026-05-02",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.listMonthEntries).toHaveBeenCalledWith(
      "2026-05",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.listPhotoFilters).toHaveBeenCalledWith(
      { from: "2026-05-01" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.listPhotoDates).toHaveBeenCalledWith(
      { to: "2026-05-31" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.compareDays).toHaveBeenCalledWith(
      "2026-05-01",
      "2026-05-02",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.listEvents).toHaveBeenCalledWith(
      { acknowledged: false },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(journalService.listInsights).toHaveBeenCalledWith(
      {
        window: "month",
        locale: "sv",
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("wires infinite photo pagination and normalizes the all filter", () => {
    const options = asInfinite(usePhotos({ filter: "all" }));

    options.queryFn({
      pageParam: "cursor-1",
      signal: new AbortController().signal,
    });

    expect(journalService.listPhotos).toHaveBeenCalledWith(
      {
        filter: undefined,
        limit: 24,
        cursor: "cursor-1",
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(options.getNextPageParam({ nextCursor: "cursor-2" })).toBe(
      "cursor-2",
    );
  });

  it("keeps polling while analysis or insight generation is active", () => {
    const today = asQuery(useTodayEntry());
    const calendar = asQuery(useCalendar("2026-05"));
    const day = asQuery(useDay("2026-05-02"));
    const insights = asQuery(useInsights());

    expect(
      today.refetchInterval?.({
        state: { data: { entry: { analysis_status: "queued" } } },
      }),
    ).toBe(5000);
    expect(
      calendar.refetchInterval?.({
        state: {
          data: {
            days: [{ analysis_status: "running" }],
          },
        },
      }),
    ).toBe(5000);
    expect(
      day.refetchInterval?.({
        state: { data: { entry: { analysis_status: "queued" } } },
      }),
    ).toBe(5000);
    expect(
      today.refetchInterval?.({
        state: { data: { entry: { analysis_status: "completed" } } },
      }),
    ).toBe(false);
    expect(
      insights.refetchInterval?.({
        state: { data: { meta: { generation_status: "sent" } } },
      }),
    ).toBe(5000);
    expect(
      insights.refetchInterval?.({
        state: { data: { meta: { generation_status: "completed" } } },
      }),
    ).toBe(false);
  });

  it("wires mutations and invalidates affected query groups", () => {
    const photo = new File(["face"], "face.jpg", { type: "image/jpeg" });

    asMutation<{
      payload: { is_pre_routine: boolean };
      photos: { head_on: File };
    }>(
      useUpsertToday(),
    ).mutationFn({ payload: { is_pre_routine: true }, photos: { head_on: photo } });
    asMutation<{ id: string; payload: { complaint_note: string } }>(
      useUpdateEntry(),
    ).mutationFn({ id: "entry-1", payload: { complaint_note: "tight" } });
    asMutation<string>(useDeleteEntry()).mutationFn("entry-1");
    asMutation<string>(useRetryAnalysis()).mutationFn("entry-1");

    expect(journalService.upsertToday).toHaveBeenCalledWith(
      { is_pre_routine: true },
      { head_on: photo },
      { onUploadProgress: expect.any(Function) },
    );
    expect(journalService.updateEntry).toHaveBeenCalledWith("entry-1", {
      complaint_note: "tight",
    });
    expect(journalService.deleteEntry).toHaveBeenCalledWith("entry-1");
    expect(journalService.retryAnalysis).toHaveBeenCalledWith("entry-1");

    const upsert = asMutation<unknown>(useUpsertToday());
    upsert.onSuccess?.({});

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QueryKey.SkinJournalToday],
    });
    expect(invalidateAppNavBadges).toHaveBeenCalledWith(mockQueryClient);
  });

  it("keeps anonymous analysis feedback in local query state only", async () => {
    const feedback = {
      vote: AnalysisFeedbackVote.NotHelpful,
      reason: AnalysisFeedbackReason.TooGeneric,
      note: "Needed more specific routine guidance.",
      interpretation_version: PhotoAnalysisInterpretationVersion.V1_1,
      reading_label: PhotoAnalysisReadingLabel.Useful,
      created_at: "2026-05-27T08:00:00.000Z",
      updated_at: "2026-05-27T08:00:00.000Z",
    };
    jest.mocked(journalService.recordAnalysisFeedback).mockResolvedValue(
      feedback,
    );

    const mutation = asMutation<
      {
        id: string;
        note: string;
        reason: AnalysisFeedbackReason.TooGeneric;
        vote: AnalysisFeedbackVote.NotHelpful;
      },
      { entryId: string; feedback: typeof feedback }
    >(useRecordAnalysisFeedback());
    const result = await mutation.mutationFn({
      id: "entry-1",
      note: "Needed more specific routine guidance.",
      reason: AnalysisFeedbackReason.TooGeneric,
      vote: AnalysisFeedbackVote.NotHelpful,
    });
    mutation.onSuccess?.(
      result as { entryId: string; feedback: typeof feedback },
      {
        id: "entry-1",
        note: "Needed more specific routine guidance.",
        reason: AnalysisFeedbackReason.TooGeneric,
        vote: AnalysisFeedbackVote.NotHelpful,
      },
    );

    expect(journalService.recordAnalysisFeedback).toHaveBeenCalledWith(
      "entry-1",
      {
        note: "Needed more specific routine guidance.",
        reason: AnalysisFeedbackReason.TooGeneric,
        vote: AnalysisFeedbackVote.NotHelpful,
      },
    );
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      [QueryKey.SkinJournalAnalysisFeedback, "entry-1"],
      feedback,
    );
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("clears local analysis feedback when analysis is rerun", () => {
    asMutation<string>(useRetryAnalysis()).onSuccess?.({}, "entry-1");

    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      [QueryKey.SkinJournalAnalysisFeedback, "entry-1"],
      null,
    );

    jest.clearAllMocks();
    asMutation<string>(useReinterpretAnalysis()).onSuccess?.({}, "entry-1");

    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      [QueryKey.SkinJournalAnalysisFeedback, "entry-1"],
      null,
    );
  });

  it("refreshes journal event, day detail, and badge state when an event is acknowledged", () => {
    asMutation<string>(useAcknowledgeEvent()).onSuccess?.({}, "event-1");

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QueryKey.SkinJournalEvents],
    });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QueryKey.SkinJournalDay],
    });
    expect(invalidateAppNavBadges).toHaveBeenCalledWith(mockQueryClient);
  });

  it("does not upload an unsupported front photo when the angle map is empty", () => {
    asMutation<{
      payload: { is_pre_routine: boolean };
      photos: Record<string, never>;
    }>(useUpsertToday()).mutationFn({
      payload: { is_pre_routine: true },
      photos: {},
    });

    expect(journalService.upsertToday).toHaveBeenCalledWith(
      { is_pre_routine: true },
      null,
    );
  });

  it("wires event, insight, and simplification mutations", () => {
    asMutation<string>(useAcknowledgeEvent()).mutationFn("event-1");
    asMutation<string>(useDismissInsight()).mutationFn("insight-1");
    asMutation<string>(useMarkInsightSeen()).mutationFn("insight-1");
    asMutation<{ id: string; action_kind: "open_compare" }>(
      useRecordInsightAction(),
    ).mutationFn({ id: "insight-1", action_kind: "open_compare" });
    asMutation<{ triggered_by_event_id: string }>(
      useStartSimplification(),
    ).mutationFn({ triggered_by_event_id: "event-1" });
    asMutation<string>(useAcknowledgeSimplification()).mutationFn(
      "simplification-1",
    );
    expect(journalService.acknowledgeEvent).toHaveBeenCalledWith("event-1");
    expect(journalService.dismissInsight).toHaveBeenCalledWith("insight-1");
    expect(journalService.markInsightSeen).toHaveBeenCalledWith("insight-1");
    expect(journalService.recordInsightAction).toHaveBeenCalledWith(
      "insight-1",
      { action_kind: "open_compare" },
    );
    expect(journalService.startSimplification).toHaveBeenCalledWith({
      triggered_by_event_id: "event-1",
    });
    expect(journalService.acknowledgeSimplification).toHaveBeenCalledWith(
      "simplification-1",
    );
  });

  it("configures hooks through TanStack Query primitives", () => {
    useTodayEntry();
    usePhotos({});
    useUpsertToday();

    expect(useQuery).toHaveBeenCalled();
    expect(useInfiniteQuery).toHaveBeenCalled();
    expect(useMutation).toHaveBeenCalled();
  });
});
