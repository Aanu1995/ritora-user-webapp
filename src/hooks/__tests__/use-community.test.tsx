import { act, waitFor } from "@testing-library/react";
import { useCommunityReviews } from "@/hooks/use-community";
import { useAuthStore } from "@/stores/auth-store";
import { renderHookWithProviders } from "@/test/utils";
import { reviewFixture } from "@/components/community/test-fixtures";
import { listCommunityReviews } from "@/services/community.service";

jest.mock("@/services/community.service", () => ({
  listCommunityReviews: jest.fn(),
  listCommunityRoutines: jest.fn(),
}));

const mockedListReviews = jest.mocked(listCommunityReviews);

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: true,
    isLoading: false,
  });
});

describe("useCommunityReviews", () => {
  it("stops pagination when the backend returns a duplicate cursor", async () => {
    mockedListReviews
      .mockResolvedValueOnce({
        items: [reviewFixture],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [{ ...reviewFixture, id: "review-2" }],
        nextCursor: "cursor-1",
      });

    const { result } = renderHookWithProviders(() => useCommunityReviews());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(mockedListReviews).toHaveBeenCalledTimes(2);
  });
});
