jest.mock("@/lib/api", () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { getRequest, postRequest } from "@/lib/api";
import {
  getSuggestion,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  regenerateSuggestion,
} from "@/services/suggestions.service";

const mockGetRequest = getRequest as jest.MockedFunction<typeof getRequest>;
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
      status: "partial",
      hasBeenEdited: true,
      cursor: "cursor-1",
    });

    expect(mockGetRequest).toHaveBeenCalledWith(
      "/suggestions/history?range=custom&from=2026-04-01&to=2026-04-29&daypart=morning&status=partial&edited=true&cursor=cursor-1",
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
