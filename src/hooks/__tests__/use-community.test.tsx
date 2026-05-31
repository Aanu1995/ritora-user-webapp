import { act, waitFor } from "@testing-library/react";
import {
  useCommunityBookmarks,
  useCommunityPeopleLikeMe,
  useCommunityReviews,
  useMyCommunitySubmissions,
} from "@/hooks/use-community";
import { useAuthStore } from "@/stores/auth-store";
import { renderHookWithProviders } from "@/test/utils";
import {
  communityHomeFixture,
  reviewFixture,
  submissionsFixture,
} from "@/components/community/test-fixtures";
import {
  getPeopleLikeMe,
  listCommunityBookmarks,
  listCommunityReviews,
  listMyCommunitySubmissions,
} from "@/services/community.service";

jest.mock("@/services/community.service", () => ({
  getPeopleLikeMe: jest.fn(),
  listCommunityBookmarks: jest.fn(),
  listCommunityReviews: jest.fn(),
  listCommunityRoutines: jest.fn(),
  listMyCommunitySubmissions: jest.fn(),
}));

const mockedGetPeopleLikeMe = jest.mocked(getPeopleLikeMe);
const mockedListBookmarks = jest.mocked(listCommunityBookmarks);
const mockedListReviews = jest.mocked(listCommunityReviews);
const mockedListSubmissions = jest.mocked(listMyCommunitySubmissions);

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

describe("useCommunityPeopleLikeMe", () => {
  it("flattens paginated people-like-me pages and stops duplicate cursors", async () => {
    mockedGetPeopleLikeMe
      .mockResolvedValueOnce({
        profileFacets: communityHomeFixture.profileFacets,
        items: [reviewFixture],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        profileFacets: communityHomeFixture.profileFacets,
        items: [{ ...reviewFixture, id: "review-2" }],
        nextCursor: "cursor-1",
      });

    const { result } = renderHookWithProviders(() =>
      useCommunityPeopleLikeMe(),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(mockedGetPeopleLikeMe).toHaveBeenLastCalledWith(
      { cursor: "cursor-1", limit: 12 },
      expect.any(AbortSignal),
    );
  });
});

describe("useCommunityBookmarks", () => {
  it("flattens paginated bookmark pages", async () => {
    mockedListBookmarks
      .mockResolvedValueOnce({
        items: [reviewFixture],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [{ ...reviewFixture, id: "review-2" }],
        nextCursor: null,
      });

    const { result } = renderHookWithProviders(() => useCommunityBookmarks());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(mockedListBookmarks).toHaveBeenLastCalledWith(
      { cursor: "cursor-1", limit: 12 },
      expect.any(AbortSignal),
    );
  });
});

describe("useMyCommunitySubmissions", () => {
  it("flattens paginated submission pages", async () => {
    mockedListSubmissions
      .mockResolvedValueOnce({
        items: [submissionsFixture[0]],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [submissionsFixture[1]],
        nextCursor: null,
      });

    const { result } = renderHookWithProviders(() =>
      useMyCommunitySubmissions(),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(mockedListSubmissions).toHaveBeenLastCalledWith(
      { cursor: "cursor-1", limit: 12 },
      expect.any(AbortSignal),
    );
  });
});
