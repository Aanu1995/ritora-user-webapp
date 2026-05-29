jest.mock("@/lib/api", () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS: 0,
  patchRequest: jest.fn(),
}));

import { deleteRequest, getRequest, patchRequest } from "@/lib/api";
import {
  deleteSmartPicksWishlistItem,
  getSmartPicksOverview,
  getSmartPicksWishlist,
  updateSmartPicksBudget,
  SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS,
} from "@/services/smart-picks.service";

const mockDeleteRequest = deleteRequest as jest.MockedFunction<
  typeof deleteRequest
>;
const mockGetRequest = getRequest as jest.MockedFunction<typeof getRequest>;
const mockPatchRequest = patchRequest as jest.MockedFunction<
  typeof patchRequest
>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("smart-picks.service", () => {
  it("fetches overview with an optional mode query", async () => {
    mockGetRequest.mockResolvedValue({ mode: "refine" });

    await getSmartPicksOverview("starter");

    expect(mockGetRequest).toHaveBeenCalledWith(
      "/smart-picks/overview?mode=starter",
      { timeout: SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS },
    );
  });

  it("fetches overview without an empty query string", async () => {
    mockGetRequest.mockResolvedValue({ mode: "refine" });

    await getSmartPicksOverview();

    expect(mockGetRequest).toHaveBeenCalledWith("/smart-picks/overview", {
      timeout: SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS,
    });
  });

  it("does not apply a client-side timeout to Smart Picks overview", () => {
    expect(SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS).toBe(0);
  });

  it("fetches and removes wishlist items", async () => {
    mockGetRequest.mockResolvedValue({ items: [] });
    mockDeleteRequest.mockResolvedValue(undefined);

    await getSmartPicksWishlist();
    await deleteSmartPicksWishlistItem("action-1");

    expect(mockGetRequest).toHaveBeenCalledWith("/smart-picks/wishlist");
    expect(mockDeleteRequest).toHaveBeenCalledWith(
      "/smart-picks/wishlist/action-1",
    );
  });

  it("updates the active Smart Picks budget tier", async () => {
    mockPatchRequest.mockResolvedValue({ recap: { budgetTier: "mid" } });

    await updateSmartPicksBudget({ budgetTier: "mid" });

    expect(mockPatchRequest).toHaveBeenCalledWith("/smart-picks/budget", {
      budgetTier: "mid",
    });
  });
});
