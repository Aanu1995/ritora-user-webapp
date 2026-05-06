jest.mock("@/lib/api", () => ({
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { getRequest, patchRequest, postRequest } from "@/lib/api";
import {
  exportSuggestionHistoryCsv,
  getRoutineBreak,
  getSuggestion,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  regenerateSuggestion,
  resumeRoutineBreak,
  startRoutineBreak,
  updateRoutineBreak,
} from "@/services/suggestions.service";

const mockGetRequest = getRequest as jest.MockedFunction<typeof getRequest>;
const mockPatchRequest = patchRequest as jest.MockedFunction<
  typeof patchRequest
>;
const mockPostRequest = postRequest as jest.MockedFunction<typeof postRequest>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("suggestions.service", () => {
  it("fetches today's suggestion contract", async () => {
    mockGetRequest.mockResolvedValue({ slots: [] });

    await getTodaysSuggestion();

    expect(mockGetRequest).toHaveBeenCalledWith("/suggestions/today");
  });

  it("calls routine break endpoints", async () => {
    mockGetRequest.mockResolvedValue({ routineBreak: null });
    mockPostRequest.mockResolvedValue({ routineBreak: null });
    mockPatchRequest.mockResolvedValue({ routineBreak: null });

    await getRoutineBreak();
    await startRoutineBreak({
      endsAt: "2026-05-07T08:00:00.000Z",
      reason: "Travel",
    });
    await resumeRoutineBreak();
    await updateRoutineBreak("break-1", { endsAt: null });

    expect(mockGetRequest).toHaveBeenCalledWith("/suggestions/break");
    expect(mockPostRequest).toHaveBeenCalledWith("/suggestions/break", {
      endsAt: "2026-05-07T08:00:00.000Z",
      reason: "Travel",
    });
    expect(mockPostRequest).toHaveBeenCalledWith(
      "/suggestions/break/resume",
      {},
    );
    expect(mockPatchRequest).toHaveBeenCalledWith(
      "/suggestions/break/break-1",
      { endsAt: null },
    );
  });

  it("fetches a single suggestion detail", async () => {
    mockGetRequest.mockResolvedValue({ id: "suggestion-1" });

    await getSuggestion("suggestion-1");

    expect(mockGetRequest).toHaveBeenCalledWith("/suggestions/suggestion-1");
  });

  it("regenerates a suggestion with an explicit reason", async () => {
    mockPostRequest.mockResolvedValue({ id: "suggestion-2" });

    await regenerateSuggestion("suggestion-1", { reason: "user_requested" });

    expect(mockPostRequest).toHaveBeenCalledWith(
      "/suggestions/suggestion-1/regenerate",
      { reason: "user_requested" },
    );
  });

  it("serializes history filters using the backend query names", async () => {
    mockGetRequest.mockResolvedValue({ days: [] });

    await getSuggestionHistory({
      range: "custom",
      fromDate: "2026-04-01",
      toDate: "2026-04-29",
      daypart: "morning",
      mode: "mixed",
      status: "partial",
      hasBeenEdited: true,
      cursor: "cursor-1",
      limit: 12,
    });

    expect(mockGetRequest).toHaveBeenCalledWith(
      "/suggestions/history?range=custom&from=2026-04-01&to=2026-04-29&daypart=morning&mode=mixed&status=partial&edited=true&cursor=cursor-1&limit=12",
    );
  });

  it("exports all matching history filters without frontend pagination params", async () => {
    const blob = new Blob(["Date\n"], { type: "text/csv" });
    mockGetRequest.mockResolvedValue(blob);

    await expect(
      exportSuggestionHistoryCsv({
        range: "custom",
        fromDate: "2026-04-01",
        toDate: "2026-04-29",
        daypart: "morning",
        mode: "mixed",
        status: "partial",
        hasBeenEdited: true,
        cursor: "cursor-1",
        limit: 12,
      }),
    ).resolves.toBe(blob);

    expect(mockGetRequest).toHaveBeenCalledWith(
      "/suggestions/history/export?range=custom&from=2026-04-01&to=2026-04-29&daypart=morning&mode=mixed&status=partial&edited=true",
      {
        headers: { Accept: "text/csv" },
        responseType: "blob",
      },
    );
  });

  it("fetches one history day for suggested-vs-applied rendering", async () => {
    mockGetRequest.mockResolvedValue({ date: "2026-04-29", slots: [] });

    await getSuggestionHistoryDay("2026-04-29");

    expect(mockGetRequest).toHaveBeenCalledWith(
      "/suggestions/history/2026-04-29",
    );
  });
});
