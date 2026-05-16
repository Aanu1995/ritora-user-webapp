import { useMutation, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { invalidateAppNavBadges } from "@/lib/query-invalidation";
import * as journalService from "@/services/skin-journal.service";
import {
  useAcknowledgeEvent,
  useAcknowledgeSimplification,
  useActiveSimplification,
  useCalendar,
  useCompareDays,
  useCreateJournalExport,
  useDay,
  useDeleteEntry,
  useDismissInsight,
  useEvents,
  useInsights,
  useJournalExport,
  useJournalStats,
  useMarkInsightSeen,
  useMonthEntries,
  usePhotoDates,
  usePhotoFilters,
  usePhotos,
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
  createJournalExport: jest.fn(),
  deleteEntry: jest.fn(),
  dismissInsight: jest.fn(),
  getActiveSimplification: jest.fn(),
  getCalendar: jest.fn(),
  getDay: jest.fn(),
  getJournalExport: jest.fn(),
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
  retryAnalysis: jest.fn(),
  startSimplification: jest.fn(),
  updateEntry: jest.fn(),
  upsertToday: jest.fn(),
}));

type QueryOptions = {
  queryKey: readonly unknown[];
  queryFn: () => unknown;
  enabled?: boolean;
  refetchInterval?: (query: { state: { data: unknown } }) => number | false;
};

type InfiniteQueryOptions = {
  queryKey: readonly unknown[];
  queryFn: (context: { pageParam: string | null }) => unknown;
  getNextPageParam: (page: { nextCursor: string | null }) => string | null;
};

type MutationOptions<TInput, TResult = unknown> = {
  mutationFn: (input: TInput) => unknown;
  onSuccess?: (result: TResult) => void;
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

describe("useSkinJournal hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("wires read queries to the Skin Journal service layer", () => {
    asQuery(useTodayEntry()).queryFn();
    asQuery(useCalendar("2026-05")).queryFn();
    asQuery(useDay("2026-05-02")).queryFn();
    asQuery(useMonthEntries("2026-05")).queryFn();
    asQuery(usePhotoFilters({ from: "2026-05-01" })).queryFn();
    asQuery(usePhotoDates({ to: "2026-05-31" })).queryFn();
    asQuery(useCompareDays("2026-05-01", "2026-05-02")).queryFn();
    asQuery(useEvents({ acknowledged: false })).queryFn();
    asQuery(useInsights({ window: "month", locale: "sv" })).queryFn();
    asQuery(useWrappedList()).queryFn();
    asQuery(useWrapped("wrapped-1")).queryFn();
    asQuery(useActiveSimplification()).queryFn();
    asQuery(useSimplification("simplification-1")).queryFn();
    asQuery(useJournalStats()).queryFn();
    asQuery(useJournalExport("export-1")).queryFn();

    expect(journalService.getTodayEntry).toHaveBeenCalled();
    expect(journalService.getCalendar).toHaveBeenCalledWith("2026-05");
    expect(journalService.getDay).toHaveBeenCalledWith("2026-05-02");
    expect(journalService.listMonthEntries).toHaveBeenCalledWith("2026-05");
    expect(journalService.listPhotoFilters).toHaveBeenCalledWith({
      from: "2026-05-01",
    });
    expect(journalService.listPhotoDates).toHaveBeenCalledWith({
      to: "2026-05-31",
    });
    expect(journalService.compareDays).toHaveBeenCalledWith(
      "2026-05-01",
      "2026-05-02",
    );
    expect(journalService.listEvents).toHaveBeenCalledWith({
      acknowledged: false,
    });
    expect(journalService.listInsights).toHaveBeenCalledWith({
      window: "month",
      locale: "sv",
    });
  });

  it("wires infinite photo pagination and normalizes the all filter", () => {
    const options = asInfinite(usePhotos({ filter: "all" }));

    options.queryFn({ pageParam: "cursor-1" });

    expect(journalService.listPhotos).toHaveBeenCalledWith({
      filter: undefined,
      limit: 24,
      cursor: "cursor-1",
    });
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

  it("wires event, insight, simplification, and export mutations", () => {
    asMutation<string>(useAcknowledgeEvent()).mutationFn("event-1");
    asMutation<string>(useDismissInsight()).mutationFn("insight-1");
    asMutation<string>(useMarkInsightSeen()).mutationFn("insight-1");
    asMutation<{ triggered_by_event_id: string }>(
      useStartSimplification(),
    ).mutationFn({ triggered_by_event_id: "event-1" });
    asMutation<string>(useAcknowledgeSimplification()).mutationFn(
      "simplification-1",
    );
    const exportMutation = asMutation<
      { from: string; to: string },
      { id: string }
    >(useCreateJournalExport());
    exportMutation.mutationFn({ from: "2026-05-01", to: "2026-05-31" });
    exportMutation.onSuccess?.({ id: "export-1" });

    expect(journalService.acknowledgeEvent).toHaveBeenCalledWith("event-1");
    expect(journalService.dismissInsight).toHaveBeenCalledWith("insight-1");
    expect(journalService.markInsightSeen).toHaveBeenCalledWith("insight-1");
    expect(journalService.startSimplification).toHaveBeenCalledWith({
      triggered_by_event_id: "event-1",
    });
    expect(journalService.acknowledgeSimplification).toHaveBeenCalledWith(
      "simplification-1",
    );
    expect(journalService.createJournalExport).toHaveBeenCalledWith({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      [QueryKey.SkinJournalExport, "export-1"],
      { id: "export-1" },
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
