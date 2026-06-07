import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import svMessages from "../../../../messages/sv.json";
import { CommunityPage } from "@/components/community/community-page";
import {
  ShareWhatWorkedPanel,
  WriteReviewPanel,
} from "@/components/community/community-eligibility";
import { ReviewEvidenceSummary } from "@/components/community/community-review-evidence";
import {
  PeopleLikeMe,
  ReviewList,
  RoutineList,
} from "@/components/community/community-lists";
import { CommunityCompactFilterToolbar } from "@/components/community/community-compact-filter-toolbar";
import { emptyPlaybookFilters } from "@/components/community/community-playbook-filters";
import { emptyReviewFilters } from "@/components/community/community-review-filters";
import { CommunityRoutineDetailPage } from "@/components/community/community-routine-detail-page";
import { MySubmissions } from "@/components/community/community-submissions";
import { CommunityOutcomeResultCard } from "@/components/community/community-outcome-result-card";
import {
  adaptCommunityRoutine,
  acceptCommunityGuidelines,
  bookmarkCommunityReview,
  createCommunityReview,
  createCommunityRoutine,
  getCommunityHome,
  getPeopleLikeMe,
  getCommunityRoutine,
  listCommunityBookmarks,
  listCommunityReviews,
  listCommunityReviewResults,
  listCommunityRoutineResults,
  listCommunityRoutines,
  listMyCommunitySubmissions,
  reportCommunityReview,
  reportCommunityRoutine,
  resubmitCommunityContent,
  signalCommunityReviewOutcome,
  signalCommunityRoutineOutcome,
  unbookmarkCommunityReview,
  unbookmarkCommunityRoutine,
  updateCommunityReview,
  updateCommunityRoutine,
  withdrawCommunityContent,
} from "@/services/community.service";
import { AppRoute } from "@/constants/app-routes";
import { createReadySkinProfile } from "@/test/skin-profile";
import { renderWithProviders } from "@/test/utils";
import {
  adaptationFixture,
  blockedPosting,
  communityHomeFixture,
  eligiblePosting,
  reviewFixture,
  routineFixture,
  submissionsFixture,
} from "../test-fixtures";
import { useAuthStore } from "@/stores/auth-store";
import type { CommunityReviewResult } from "@/types/community";

const mockUseShelfProducts = jest.fn();
const mockUseSkinProfile = jest.fn();
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

type MockIntersectionObserverInstance = {
  callback: IntersectionObserverCallback;
  disconnect: jest.Mock<void, []>;
  observe: jest.Mock<void, [Element]>;
};

const intersectionObservers: MockIntersectionObserverInstance[] = [];

function installIntersectionObserverMock() {
  class MockIntersectionObserver {
    private readonly instance: MockIntersectionObserverInstance;

    constructor(callback: IntersectionObserverCallback) {
      this.instance = {
        callback,
        disconnect: jest.fn(),
        observe: jest.fn(),
      };
      intersectionObservers.push(this.instance);
    }

    observe(element: Element) {
      this.instance.observe(element);
    }

    disconnect() {
      this.instance.disconnect();
    }

    unobserve() {
      return undefined;
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(global, "IntersectionObserver", {
    configurable: true,
    value: MockIntersectionObserver,
  });
}

function triggerLastIntersection(target: Element) {
  const observer = intersectionObservers.at(-1);
  if (!observer) {
    throw new Error("Expected an IntersectionObserver instance.");
  }

  observer.callback(
    [
      {
        isIntersecting: true,
        target,
      } as IntersectionObserverEntry,
    ],
    {} as IntersectionObserver,
  );
}

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/services/community.service", () => ({
  acceptCommunityGuidelines: jest.fn(),
  adaptCommunityRoutine: jest.fn(),
  bookmarkCommunityReview: jest.fn(),
  bookmarkCommunityRoutine: jest.fn(),
  createCommunityReview: jest.fn(),
  createCommunityRoutine: jest.fn(),
  getCommunityHome: jest.fn(),
  getPeopleLikeMe: jest.fn(),
  getCommunityRoutine: jest.fn(),
  listCommunityBookmarks: jest.fn(),
  listCommunityReviews: jest.fn(),
  listCommunityReviewResults: jest.fn(),
  listCommunityRoutineResults: jest.fn(),
  listCommunityRoutines: jest.fn(),
  listMyCommunitySubmissions: jest.fn(),
  reportCommunityReview: jest.fn(),
  reportCommunityRoutine: jest.fn(),
  resubmitCommunityContent: jest.fn(),
  signalCommunityReviewOutcome: jest.fn(),
  signalCommunityRoutineOutcome: jest.fn(),
  unbookmarkCommunityReview: jest.fn(),
  unbookmarkCommunityRoutine: jest.fn(),
  updateCommunityReview: jest.fn(),
  updateCommunityRoutine: jest.fn(),
  withdrawCommunityContent: jest.fn(),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useShelfProducts: () => mockUseShelfProducts(),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockUseSkinProfile(),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({ timeZone: "UTC" }),
}));

const mockedGetCommunityHome = jest.mocked(getCommunityHome);
const mockedGetPeopleLikeMe = jest.mocked(getPeopleLikeMe);
const mockedAcceptGuidelines = jest.mocked(acceptCommunityGuidelines);
const mockedCreateReview = jest.mocked(createCommunityReview);
const mockedCreateRoutine = jest.mocked(createCommunityRoutine);
const mockedGetRoutine = jest.mocked(getCommunityRoutine);
const mockedListBookmarks = jest.mocked(listCommunityBookmarks);
const mockedListReviews = jest.mocked(listCommunityReviews);
const mockedListReviewResults = jest.mocked(listCommunityReviewResults);
const mockedListRoutineResults = jest.mocked(listCommunityRoutineResults);
const mockedListRoutines = jest.mocked(listCommunityRoutines);
const mockedAdaptRoutine = jest.mocked(adaptCommunityRoutine);
const mockedSignalRoutineOutcome = jest.mocked(signalCommunityRoutineOutcome);
const mockedBookmarkReview = jest.mocked(bookmarkCommunityReview);
const mockedUnbookmarkRoutine = jest.mocked(unbookmarkCommunityRoutine);
const mockedUnbookmarkReview = jest.mocked(unbookmarkCommunityReview);
const mockedReportRoutine = jest.mocked(reportCommunityRoutine);
const mockedReportReview = jest.mocked(reportCommunityReview);
const mockedSignalReviewOutcome = jest.mocked(signalCommunityReviewOutcome);
const mockedListSubmissions = jest.mocked(listMyCommunitySubmissions);
const mockedResubmit = jest.mocked(resubmitCommunityContent);
const mockedUpdateReview = jest.mocked(updateCommunityReview);
const mockedUpdateRoutine = jest.mocked(updateCommunityRoutine);
const mockedWithdraw = jest.mocked(withdrawCommunityContent);
const mockedToast = jest.mocked(toast);

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  intersectionObservers.length = 0;
  mockSearchParams = new URLSearchParams();
  useAuthStore.setState({ isAuthenticated: true, isLoading: false });
  mockUseSkinProfile.mockReturnValue({
    data: createReadySkinProfile(),
    error: null,
    isError: false,
    isLoading: false,
  });
  mockUseShelfProducts.mockReturnValue({
    data: [
      {
        id: "product-cleanser",
        identity: {
          brand: "Ritora",
          category: "cleanser",
          name: "Milky Cleanser",
        },
      },
      {
        id: "product-cream",
        identity: {
          brand: "Ritora",
          category: "moisturizer",
          name: "Barrier Cream",
        },
      },
      {
        id: "product-toner",
        identity: {
          brand: "Ritora",
          category: "toner",
          name: "Calm Toner",
        },
      },
    ],
    isLoading: false,
  });
  mockedListReviewResults.mockResolvedValue({
    counts: reviewFixture.outcomeSignalCounts,
    items: [],
    nextCursor: null,
  });
  mockedListRoutineResults.mockResolvedValue({
    counts: routineFixture.outcomeSignalCounts,
    items: [],
    nextCursor: null,
  });
  mockedListReviews.mockResolvedValue({
    items: [reviewFixture],
    nextCursor: null,
  });
  mockedListRoutines.mockResolvedValue({
    items: [routineFixture],
    nextCursor: null,
  });
  mockedListBookmarks.mockResolvedValue({
    items: [routineFixture, reviewFixture],
    nextCursor: null,
  });
  mockedGetPeopleLikeMe.mockResolvedValue({
    profileFacets: communityHomeFixture.profileFacets,
    items: [routineFixture, reviewFixture],
    nextCursor: null,
  });
});

describe("ReviewEvidenceSummary", () => {
  it("localizes community-only safe facets without missing-message lookups", () => {
    render(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <ReviewEvidenceSummary
          review={{
            ...reviewFixture,
            safeFacets: {
              ...reviewFixture.safeFacets,
              climateBucket: "temperate",
              concernTags: ["dark-marks"],
            },
          }}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Tempererat")).toBeInTheDocument();
    expect(screen.getByText("Mörka märken")).toBeInTheDocument();
    expect(screen.queryByText("Temperate")).not.toBeInTheDocument();
    expect(screen.queryByText("Dark Marks")).not.toBeInTheDocument();
  });
});

describe("CommunityOutcomeResultCard", () => {
  it("humanizes unknown enum fallback labels instead of showing raw keys", () => {
    const item: CommunityReviewResult = {
      id: "outcome-unknown",
      signal: "unexpected_signal" as CommunityReviewResult["signal"],
      sameGoal: true,
      trialDuration:
        "longer_than_expected" as CommunityReviewResult["trialDuration"],
      followedParts: [
        "custom_part" as CommunityReviewResult["followedParts"][number],
      ],
      irritationLevel:
        "very_high" as CommunityReviewResult["irritationLevel"],
      routineSlot: null,
      usedWithProducts: [
        {
          productBrand: null,
          productName: null,
          category: "special-mask",
        },
      ],
      note: null,
      noteModerationStatus: "published",
      similarToViewer: false,
      createdAt: "2026-06-07T12:00:00.000Z",
      updatedAt: "2026-06-07T12:00:00.000Z",
    };

    renderWithProviders(
      <CommunityOutcomeResultCard contentType="review" item={item} />,
    );

    expect(screen.getByText("Unexpected Signal")).toBeInTheDocument();
    expect(screen.getByText("Longer Than Expected")).toBeInTheDocument();
    expect(screen.getByText("Very High")).toBeInTheDocument();
    expect(screen.getByText("Custom Part")).toBeInTheDocument();
    expect(screen.getByText("Special Mask")).toBeInTheDocument();
    expect(screen.queryByText("unexpected_signal")).not.toBeInTheDocument();
    expect(screen.queryByText("longer_than_expected")).not.toBeInTheDocument();
    expect(screen.queryByText("custom_part")).not.toBeInTheDocument();
  });
});

describe("Community lists pagination", () => {
  it("renders auto-load sentinels without showing retry before a fetch-more failure", () => {
    renderWithProviders(
      <>
        <RoutineList
          routines={[routineFixture]}
          hasNextPage
          onLoadMore={jest.fn()}
        />
        <ReviewList
          reviews={[reviewFixture]}
          hasNextPage
          onLoadMore={jest.fn()}
        />
        <PeopleLikeMe
          items={[routineFixture, reviewFixture]}
          hasNextPage
          onLoadMore={jest.fn()}
        />
      </>,
    );

    expect(
      screen.getByTestId("community-routines-auto-load-sentinel"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("community-reviews-auto-load-sentinel"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("community-people-auto-load-sentinel"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Ritora Milk Cleanser/).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
  });

  it("only shows the pagination retry action when fetching more fails", async () => {
    const retry = jest.fn();

    renderWithProviders(
      <ReviewList
        reviews={[reviewFixture]}
        hasLoadMoreError
        onRetryLoadMore={retry}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps auto-loading guarded while the load-more request is pending", async () => {
    installIntersectionObserverMock();
    const loadMore = jest.fn(() => new Promise<unknown>(() => undefined));

    renderWithProviders(
      <ReviewList
        reviews={[reviewFixture]}
        hasNextPage
        onLoadMore={loadMore}
      />,
    );

    const sentinel = screen.getByTestId("community-reviews-auto-load-sentinel");
    await waitFor(() => expect(intersectionObservers).toHaveLength(1));

    act(() => triggerLastIntersection(sentinel));
    act(() => triggerLastIntersection(sentinel));

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("opens playbook details in a side panel instead of navigating away", async () => {
    mockedGetRoutine.mockResolvedValue(routineFixture);

    const { container } = renderWithProviders(
      <RoutineList routines={[routineFixture]} />,
    );

    expect(
      screen.queryByRole("link", { name: "View playbook" }),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(`time[datetime="${routineFixture.createdAt}"]`),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "View playbook" }),
    );

    expect(mockedGetRoutine).toHaveBeenCalledWith(
      "routine-1",
      expect.any(AbortSignal),
    );

    const panel = await screen.findByRole("dialog");
    /* Sheet header now shows the routine TITLE as the
       SheetTitle (passed from the card), with "Playbook" as
       a small eyebrow above it — replaces the previous
       generic "Playbook details" SheetTitle. Asserting the
       eyebrow proves the header structure is intact; the
       title assertion below proves the right routine
       rendered. */
    expect(within(panel).getByText("Playbook")).toBeInTheDocument();
    expect(
      within(panel).getByRole("heading", { name: "Quiet AM barrier routine" }),
    ).toBeInTheDocument();
    expect(
      await within(panel).findByText("Products and routine pattern"),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("button", { name: /check my shelf/i }),
    ).toBeInTheDocument();
  });

  it("renders backend-backed review and playbook search filters", () => {
    const onReviewFiltersChange = jest.fn();
    const onPlaybookFiltersChange = jest.fn();

    renderWithProviders(
      <>
        <RoutineList
          routines={[]}
          filters={emptyPlaybookFilters}
          onFiltersChange={onPlaybookFiltersChange}
        />
        <ReviewList
          reviews={[]}
          filters={emptyReviewFilters}
          onFiltersChange={onReviewFiltersChange}
        />
      </>,
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Search goals, products, habits, avoided triggers…",
      ),
      { target: { value: "barrier" } },
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        "Search product, brand, outcome, or paired product…",
      ),
      { target: { value: "azelaic" } },
    );

    expect(onPlaybookFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "barrier" }),
    );
    expect(onReviewFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "azelaic" }),
    );
  });

  it("keeps sheet filter changes local until Done is clicked", async () => {
    type TestFilters = {
      concern: string;
      productCategory: string;
    };
    const onFiltersChange = jest.fn();

    renderWithProviders(
      <CommunityCompactFilterToolbar<TestFilters>
        activeCount={0}
        anyActive={false}
        ariaLabel="Test filters"
        emptyValue={{ concern: "", productCategory: "" }}
        inlineFilters={[]}
        onChange={onFiltersChange}
        sheetDescription="Choose filters"
        sheetFilters={[
          {
            key: "concern",
            label: "Concern",
            options: [{ value: "acne", label: "Acne" }],
          },
          {
            key: "productCategory",
            label: "Product category",
            options: [{ value: "serum", label: "Serum" }],
          },
        ]}
        sheetTitle="Filter reviews"
        value={{ concern: "", productCategory: "" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Filter reviews",
    });

    await userEvent.click(within(dialog).getAllByRole("combobox")[0]);
    await userEvent.click(await screen.findByRole("option", { name: "Acne" }));

    expect(onFiltersChange).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      concern: "acne",
      productCategory: "",
    });
  });
});

describe("CommunityPage", () => {
  it("gates Community behind a completed skin profile", async () => {
    const user = userEvent.setup();
    mockUseSkinProfile.mockReturnValue({
      data: null,
      error: null,
      isError: false,
      isLoading: false,
    });

    renderWithProviders(<CommunityPage />);

    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "Ritora needs your skin profile before it can safely match community playbooks, reviews, and product evidence to you.",
      ).length,
    ).toBeGreaterThan(0);
    const dialog = await screen.findByRole("alertdialog", {
      name: "Finish your skin profile first",
    });

    expect(mockedGetCommunityHome).not.toHaveBeenCalled();
    expect(mockedGetPeopleLikeMe).not.toHaveBeenCalled();
    expect(mockedListRoutines).not.toHaveBeenCalled();
    expect(mockedListReviews).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Open skin profile" }),
    );
    expect(mockPush).toHaveBeenCalledWith(AppRoute.SkinProfile);
  });

  it("renders matched evidence, tab navigation, disabled reporting, and blocked-posting guidance", async () => {
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);
    mockedAcceptGuidelines.mockResolvedValue({
      ...blockedPosting,
      hasAcceptedGuidelines: true,
    });
    mockedSignalReviewOutcome.mockResolvedValue({
      signal: "worked_for_me_too",
      noteModerationStatus: "published",
      outcomeSignalCounts: reviewFixture.outcomeSignalCounts,
    });
    mockedSignalRoutineOutcome.mockResolvedValue({
      signal: "worked_for_me_too",
      noteModerationStatus: "published",
      outcomeSignalCounts: routineFixture.outcomeSignalCounts,
    });

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByRole("heading", { name: "Community" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /for you/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /see top matches/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /people like me/i }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Quiet AM barrier routine")).toBeInTheDocument();
    expect(screen.getByText("Ritora Barrier Cream")).toBeInTheDocument();

    expect(screen.getByText("92% match")).toBeInTheDocument();
    expect(screen.getByText("76% match")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /report/i }),
    ).not.toBeInTheDocument();
    expect(mockedReportReview).not.toHaveBeenCalled();
    expect(mockedReportRoutine).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("tab", { name: /write review/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /share what worked/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /bookmarks/i })).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /write a review/i }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Community posting is not available yet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Account age requirement").length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Verify email" })).toHaveAttribute(
      "href",
      "/resend-verification",
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: /accept rules/i })[0],
    );
    await waitFor(() =>
      expect(mockedAcceptGuidelines).toHaveBeenCalledTimes(1),
    );
  });

  it("saves community cards and shows bookmarked cards with remove actions", async () => {
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);
    mockedBookmarkReview.mockResolvedValue({ bookmarked: true });
    mockedUnbookmarkReview.mockResolvedValue({ bookmarked: false });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    const reviewCard = (
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" })
    ).closest("article");
    if (!reviewCard) throw new Error("Expected review card.");

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Save" }),
    );
    await waitFor(() =>
      expect(mockedBookmarkReview).toHaveBeenCalledWith(reviewFixture.id),
    );

    await userEvent.click(screen.getByRole("tab", { name: /bookmarks/i }));
    await waitFor(() =>
      expect(mockedListBookmarks).toHaveBeenCalledWith(
        { cursor: null, limit: 12 },
        expect.any(AbortSignal),
      ),
    );
    const savedReviewCard = (
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" })
    ).closest("article");
    if (!savedReviewCard) throw new Error("Expected saved review card.");
    expect(
      within(savedReviewCard).getByRole("button", { name: "Remove bookmark" }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(savedReviewCard).getByRole("button", {
        name: "Remove bookmark",
      }),
    );
    await waitFor(() =>
      expect(mockedUnbookmarkReview).toHaveBeenCalledWith(reviewFixture.id),
    );
  });

  it("indicates when review and playbook cards are already bookmarked", async () => {
    mockedUnbookmarkReview.mockResolvedValue({ bookmarked: false });
    mockedUnbookmarkRoutine.mockResolvedValue({ bookmarked: false });

    renderWithProviders(
      <>
        <ReviewList
          reviews={[{ ...reviewFixture, bookmarkedByViewer: true }]}
        />
        <RoutineList
          routines={[{ ...routineFixture, bookmarkedByViewer: true }]}
        />
      </>,
    );

    const bookmarkedButtons = screen.getAllByRole("button", {
      name: "Bookmarked",
    });
    expect(bookmarkedButtons).toHaveLength(2);
    bookmarkedButtons.forEach((button) => {
      expect(button).toHaveClass("h-8", "w-8");
    });

    const reviewCard = screen
      .getByRole("heading", { name: "Ritora Barrier Cream" })
      .closest("article");
    const routineCard = screen
      .getByRole("heading", { name: routineFixture.title })
      .closest("article");
    const reviewActions = reviewCard?.firstElementChild?.lastElementChild;
    const routineActions = routineCard?.firstElementChild?.lastElementChild;
    expect(reviewActions?.lastElementChild).toBe(bookmarkedButtons[0]);
    expect(routineActions?.lastElementChild).toBe(bookmarkedButtons[1]);

    await userEvent.click(bookmarkedButtons[0]);
    await waitFor(() =>
      expect(mockedUnbookmarkReview).toHaveBeenCalledWith(reviewFixture.id),
    );

    await userEvent.click(bookmarkedButtons[1]);
    await waitFor(() =>
      expect(mockedUnbookmarkRoutine).toHaveBeenCalledWith(routineFixture.id),
    );
  });

  it("does not render bookmarked items that are under moderation", async () => {
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);
    mockedListBookmarks.mockResolvedValue({
      items: [
        {
          ...reviewFixture,
          moderationStatus: "pending_review",
        },
      ],
      nextCursor: null,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(
      await screen.findByRole("tab", { name: /bookmarks/i }),
    );

    expect(
      await screen.findByText("No saved community evidence yet"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ritora Barrier Cream")).not.toBeInTheDocument();
  });

  it("redirects legacy For You tab state to People like me", async () => {
    mockSearchParams = new URLSearchParams("tab=for-you");
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByRole("heading", { name: "Community" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /for you/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /people like me/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("opens writing forms from the viewing tabs for eligible posters", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /write a review/i }),
    );
    expect(
      await screen.findByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick from your shelf so people see this in context. Choose Other if it isn't on your shelf yet.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Overall satisfaction.")).toBeInTheDocument();
    expect(screen.getByText("How much it helped.")).toBeInTheDocument();
    expect(screen.getByText("1 = none, 5 = severe.")).toBeInTheDocument();
    expect(screen.getByText("How long until you knew.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose honestly so Ritora does not force fake routine context.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Comma-separated keywords that make this searchable."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add nuance that ratings and tags can't show."),
    ).toBeInTheDocument();

    // Composers now open as a right-side Sheet (modal), so close it
    // before switching tabs so the test can interact with the
    // underlying page chrome again.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /submit review/i }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("tab", { name: /playbooks/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /share a playbook/i }),
    );
    expect(
      await screen.findByRole("button", { name: /share playbook/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A short name for what worked."),
    ).toBeInTheDocument();
    expect(screen.getByText("What this playbook was for.")).toBeInTheDocument();
    expect(
      screen.getByText("Optional. Pick the closest outcome."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How long until you knew it worked."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Things that helped because you stopped doing them."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Optional. Sleep, food, activity, or anything else that may have helped.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Lifestyle changes")).toBeInTheDocument();
  });

  it("guards unsaved review drafts before closing the create sheet", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /write a review/i }),
    );

    const reviewDialog = await screen.findByRole("dialog", {
      name: "Write a review",
    });
    const reviewedProductSelect = reviewDialog.querySelector<HTMLSelectElement>(
      'select[name="selectedShelfProductId"]',
    );
    if (!reviewedProductSelect) {
      throw new Error("Expected review product picker.");
    }

    fireEvent.change(reviewedProductSelect, {
      target: { value: "product-cream" },
    });
    await userEvent.click(
      within(reviewDialog).getByRole("button", { name: "Close" }),
    );

    const discardDialog = await screen.findByRole("alertdialog", {
      name: "Discard review changes?",
    });
    await userEvent.click(
      within(discardDialog).getByRole("button", { name: "Keep editing" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Write a review" }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(reviewDialog).getByRole("button", { name: "Close" }),
    );
    await userEvent.click(
      within(
        await screen.findByRole("alertdialog", {
          name: "Discard review changes?",
        }),
      ).getByRole("button", { name: "Discard changes" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Write a review" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("guards unsaved playbook drafts before closing the create sheet", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(
      await screen.findByRole("tab", { name: /playbooks/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /share a playbook/i }),
    );

    const playbookDialog = await screen.findByRole("dialog", {
      name: "Share a playbook",
    });
    const titleInput = playbookDialog.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    if (!titleInput) {
      throw new Error("Expected playbook title field.");
    }

    fireEvent.change(titleInput, {
      target: { value: "What helped my barrier" },
    });
    await userEvent.click(
      within(playbookDialog).getByRole("button", { name: "Close" }),
    );

    const discardDialog = await screen.findByRole("alertdialog", {
      name: "Discard playbook changes?",
    });
    await userEvent.click(
      within(discardDialog).getByRole("button", { name: "Keep editing" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Share a playbook" }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(playbookDialog).getByRole("button", { name: "Close" }),
    );
    await userEvent.click(
      within(
        await screen.findByRole("alertdialog", {
          name: "Discard playbook changes?",
        }),
      ).getByRole("button", { name: "Discard changes" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Share a playbook" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows posting guidance instead of opening composer deep links for blocked posters", async () => {
    mockSearchParams = new URLSearchParams("tab=write-review");
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByRole("dialog", {
        name: "Community posting is not available yet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit review/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty matching copy and retries when the home query fails", async () => {
    mockedGetPeopleLikeMe.mockResolvedValueOnce({
      profileFacets: {
        skinType: null,
        concernTags: [],
        sensitivityLevel: null,
        skinToneRange: null,
        climateBucket: null,
        routinePace: null,
        goalTags: [],
      },
      items: [],
      nextCursor: null,
    });
    mockedGetCommunityHome.mockResolvedValueOnce({
      ...communityHomeFixture,
      profileFacets: {
        skinType: null,
        concernTags: [],
        sensitivityLevel: null,
        skinToneRange: null,
        climateBucket: null,
        routinePace: null,
        goalTags: [],
      },
      patterns: [],
      routines: [],
      reviews: [],
      warnings: [],
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByText(
        /Complete your skin profile for better matching/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("No community evidence yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Once people with skin like yours share playbooks and reviews, you'll see them here.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a retry panel when community home cannot load", async () => {
    mockedGetCommunityHome
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(communityHomeFixture);

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByText("Community could not load"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByText("Quiet AM barrier routine"),
    ).toBeInTheDocument();
  });

  it("collects moderated playbook result notes and product context before adding outcome evidence", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedSignalRoutineOutcome.mockResolvedValue({
      signal: "worked_for_me_too",
      noteModerationStatus: "published",
      outcomeSignalCounts: routineFixture.outcomeSignalCounts,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(
      (
        await screen.findAllByRole("button", {
          name: /worked for me too/i,
        })
      )[0],
    );

    expect(
      await screen.findByRole("dialog", { name: /confirm your outcome/i }),
    ).toBeInTheDocument();

    const sameGoalSelect = document.querySelector<HTMLSelectElement>(
      'select[name="sameGoal"]',
    );
    const trialDurationSelect = document.querySelector<HTMLSelectElement>(
      'select[name="trialDuration"]',
    );
    const irritationSelect = document.querySelector<HTMLSelectElement>(
      'select[name="irritationLevel"]',
    );
    const routineSlotSelect = document.querySelector<HTMLSelectElement>(
      'select[name="routineSlot"]',
    );
    const noteInput = document.querySelector<HTMLTextAreaElement>(
      'textarea[name="note"]',
    );
    if (
      !sameGoalSelect ||
      !trialDurationSelect ||
      !irritationSelect ||
      !routineSlotSelect ||
      !noteInput
    ) {
      throw new Error("Expected outcome context fields.");
    }

    fireEvent.change(sameGoalSelect, { target: { value: "true" } });
    fireEvent.change(trialDurationSelect, {
      target: { value: "8-weeks" },
    });
    fireEvent.change(irritationSelect, { target: { value: "none" } });
    fireEvent.change(routineSlotSelect, { target: { value: "pm" } });
    const outcomeDialog = screen.getByRole("dialog", {
      name: /confirm your outcome/i,
    });
    await userEvent.click(within(outcomeDialog).getByText("Products"));
    await userEvent.click(within(outcomeDialog).getByText("Habits"));
    await userEvent.click(
      screen.getByRole("button", {
        name: /add product used with it/i,
      }),
    );
    const usedWithSelect = document.querySelector<HTMLSelectElement>(
      'select[name="usedWithProducts.0.productId"]',
    );
    if (!usedWithSelect) {
      throw new Error("Expected used-with product selector.");
    }
    fireEvent.change(usedWithSelect, {
      target: { value: "product-cleanser" },
    });
    fireEvent.change(noteInput, {
      target: {
        value: "I followed the cleanser step and changed the evening timing.",
      },
    });
    await userEvent.click(screen.getByRole("button", { name: /add outcome/i }));

    await waitFor(() =>
      expect(mockedSignalRoutineOutcome).toHaveBeenCalledWith("routine-1", {
        signal: "worked_for_me_too",
        sameGoal: true,
        trialDuration: "8-weeks",
        followedParts: ["products", "habits"],
        irritationLevel: "none",
        routineSlot: "pm",
        usedWithProducts: [
          {
            category: "cleanser",
            productBrand: "Ritora",
            productId: "product-cleanser",
            productName: "Milky Cleanser",
          },
        ],
        note: "I followed the cleanser step and changed the evening timing.",
      }),
    );
  });

  it("uses review-specific product confirmation copy for review outcome evidence", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedSignalReviewOutcome.mockResolvedValue({
      signal: "worked_for_me_too",
      noteModerationStatus: "published",
      outcomeSignalCounts: reviewFixture.outcomeSignalCounts,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    expect(
      await screen.findByText(
        "11 of 13 people confirmed this product worked for them",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tap an icon below to say whether this reviewed product worked for you too. Your context helps Ritora rank product evidence.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /worked for me too/i }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: /confirm product result/i,
    });

    expect(
      within(dialog).getByText("What matched your use?"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Confirm only if you used the reviewed product yourself. Ritora uses your context as product evidence, not as a score against the reviewer.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Same product")).toBeInTheDocument();
    expect(
      within(dialog).queryByText("What did you follow?"),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Avoid list")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Habits")).not.toBeInTheDocument();

    const sameGoalSelect = dialog.querySelector<HTMLSelectElement>(
      'select[name="sameGoal"]',
    );
    const trialDurationSelect = dialog.querySelector<HTMLSelectElement>(
      'select[name="trialDuration"]',
    );
    const irritationSelect = dialog.querySelector<HTMLSelectElement>(
      'select[name="irritationLevel"]',
    );
    const routineSlotSelect = dialog.querySelector<HTMLSelectElement>(
      'select[name="routineSlot"]',
    );
    const noteInput = dialog.querySelector<HTMLTextAreaElement>(
      'textarea[name="note"]',
    );
    if (
      !sameGoalSelect ||
      !trialDurationSelect ||
      !irritationSelect ||
      !routineSlotSelect ||
      !noteInput
    ) {
      throw new Error("Expected review outcome context fields.");
    }

    fireEvent.change(sameGoalSelect, { target: { value: "true" } });
    fireEvent.change(trialDurationSelect, {
      target: { value: "8-weeks" },
    });
    fireEvent.change(irritationSelect, { target: { value: "none" } });
    fireEvent.change(routineSlotSelect, { target: { value: "pm" } });
    await userEvent.click(within(dialog).getByText("Same product"));
    await userEvent.click(
      within(dialog).getByRole("button", {
        name: /add product used with it/i,
      }),
    );
    const usedWithSelect = dialog.querySelector<HTMLSelectElement>(
      'select[name="usedWithProducts.0.productId"]',
    );
    if (!usedWithSelect) {
      throw new Error("Expected used-with product selector.");
    }
    fireEvent.change(usedWithSelect, {
      target: { value: "product-cleanser" },
    });
    fireEvent.change(noteInput, {
      target: { value: "It worked better with a gentle cleanser." },
    });
    await userEvent.click(
      within(dialog).getByRole("button", {
        name: /confirm product result/i,
      }),
    );

    await waitFor(() =>
      expect(mockedSignalReviewOutcome).toHaveBeenCalledWith("review-1", {
        signal: "worked_for_me_too",
        sameGoal: true,
        trialDuration: "8-weeks",
        followedParts: ["products"],
        irritationLevel: "none",
        routineSlot: "pm",
        usedWithProducts: [
          {
            category: "cleanser",
            productBrand: "Ritora",
            productId: "product-cleanser",
            productName: "Milky Cleanser",
          },
        ],
        note: "It worked better with a gentle cleanser.",
      }),
    );
  });

  it("opens filtered community results for review confirmations", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedListReviewResults.mockResolvedValue({
      counts: reviewFixture.outcomeSignalCounts,
      items: [
        {
          id: "vote-1",
          signal: "worked_for_me_too",
          sameGoal: true,
          trialDuration: "8-weeks",
          followedParts: ["products"],
          irritationLevel: "none",
          routineSlot: "pm",
          usedWithProducts: [
            {
              category: "cleanser",
              productBrand: "Ritora",
              productName: "Milky Cleanser",
            },
          ],
          note: "The cleanser pairing made it less drying.",
          noteModerationStatus: "published",
          similarToViewer: true,
          createdAt: "2026-05-01T10:00:00.000Z",
          updatedAt: "2026-05-01T10:00:00.000Z",
        },
      ],
      nextCursor: null,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: /view community results/i }),
    );

    // The sheet's accessible name is now the product itself
    // ("Ritora Barrier Cream") because the redesigned header
    // promotes the product name to the SheetTitle and demotes
    // "Community results" to a small eyebrow above it.
    const sheet = await screen.findByRole("dialog", {
      name: /ritora barrier cream/i,
    });
    expect(
      within(sheet).getByText("The cleanser pairing made it less drying."),
    ).toBeInTheDocument();
    expect(
      within(sheet).getByText("Ritora Milky Cleanser"),
    ).toBeInTheDocument();
    expect(within(sheet).getByText("Same product")).toBeInTheDocument();

    // Filter is now a row of tone-coded pill buttons (the
    // previous Select dropdown was replaced for one-tap
    // filtering). Each pill is an `aria-pressed` button labeled
    // with the signal's short text (e.g. "Worked").
    const workedFilter = within(sheet).getByRole("button", {
      name: "Worked",
    });
    await userEvent.click(workedFilter);

    await waitFor(() =>
      expect(mockedListReviewResults).toHaveBeenLastCalledWith(
        "review-1",
        {
          cursor: null,
          limit: 12,
          signal: "worked_for_me_too",
        },
        expect.any(AbortSignal),
      ),
    );
  });

  it("automatically loads more review result notes when the sheet reaches the end", async () => {
    installIntersectionObserverMock();
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedListReviewResults
      .mockResolvedValueOnce({
        counts: reviewFixture.outcomeSignalCounts,
        items: [
          {
            id: "vote-1",
            signal: "worked_for_me_too",
            sameGoal: true,
            trialDuration: "8-weeks",
            followedParts: ["products"],
            irritationLevel: "none",
            routineSlot: "pm",
            usedWithProducts: [],
            note: "First result note.",
            noteModerationStatus: "published",
            similarToViewer: true,
            createdAt: "2026-05-02T10:00:00.000Z",
            updatedAt: "2026-05-02T10:00:00.000Z",
          },
        ],
        nextCursor: "review-result-cursor",
      })
      .mockResolvedValueOnce({
        counts: reviewFixture.outcomeSignalCounts,
        items: [
          {
            id: "vote-2",
            signal: "worked_with_changes",
            sameGoal: false,
            trialDuration: "4-weeks",
            followedParts: ["products"],
            irritationLevel: "mild",
            routineSlot: null,
            usedWithProducts: [],
            note: "Second result note.",
            noteModerationStatus: "published",
            similarToViewer: false,
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-01T10:00:00.000Z",
          },
        ],
        nextCursor: null,
      });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: /view community results/i }),
    );

    const sheet = await screen.findByRole("dialog", {
      name: /ritora barrier cream/i,
    });
    expect(within(sheet).getByText("First result note.")).toBeInTheDocument();

    const sentinel = within(sheet).getByTestId(
      "community-results-load-more-sentinel",
    );
    act(() => triggerLastIntersection(sentinel));

    await waitFor(() =>
      expect(mockedListReviewResults).toHaveBeenLastCalledWith(
        "review-1",
        {
          cursor: "review-result-cursor",
          limit: 12,
          signal: "",
        },
        expect.any(AbortSignal),
      ),
    );
    expect(within(sheet).getByText("Second result note.")).toBeInTheDocument();
  });

  it("opens filtered community results for playbook confirmations", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedListRoutineResults.mockResolvedValue({
      counts: routineFixture.outcomeSignalCounts,
      items: [
        {
          id: "routine-vote-1",
          signal: "worked_with_changes",
          sameGoal: true,
          trialDuration: "8-weeks",
          followedParts: ["products", "habits"],
          irritationLevel: "none",
          routineSlot: "pm",
          usedWithProducts: [
            {
              category: "cleanser",
              productBrand: "Ritora",
              productName: "Milky Cleanser",
            },
          ],
          note: "I followed the cleanser step and sleep habit, but used my own moisturizer.",
          noteModerationStatus: "published",
          similarToViewer: true,
          createdAt: "2026-05-01T10:00:00.000Z",
          updatedAt: "2026-05-01T10:00:00.000Z",
        },
      ],
      nextCursor: null,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(
      await screen.findByRole("tab", { name: /playbooks/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /view community results/i }),
    );

    const sheet = await screen.findByRole("dialog", {
      name: /quiet am barrier routine/i,
    });
    expect(
      within(sheet).getByText(
        "I followed the cleanser step and sleep habit, but used my own moisturizer.",
      ),
    ).toBeInTheDocument();
    expect(
      within(sheet).getByText("Ritora Milky Cleanser"),
    ).toBeInTheDocument();
    expect(within(sheet).getByText("Products")).toBeInTheDocument();
    expect(within(sheet).queryByText("Same product")).not.toBeInTheDocument();

    const changedFilter = within(sheet).getByRole("button", {
      name: "Changed",
    });
    await userEvent.click(changedFilter);

    await waitFor(() =>
      expect(mockedListRoutineResults).toHaveBeenLastCalledWith(
        "routine-1",
        {
          cursor: null,
          limit: 12,
          signal: "worked_with_changes",
        },
        expect.any(AbortSignal),
      ),
    );
  });

  it("disables outcome comments and hides reporting on reviews authored by the current user", async () => {
    const ownReview = {
      ...reviewFixture,
      canSignalOutcome: false,
      canReportContent: false,
    };
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
      routines: [],
      reviews: [ownReview],
    });
    mockedListReviews.mockResolvedValue({
      items: [ownReview],
      nextCursor: null,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));

    await screen.findByText(
      "Tap an icon below to say whether this reviewed product worked for you too. Your context helps Ritora rank product evidence.",
    );
    expect(
      screen.getByText("Ritora Barrier Cream").closest("article"),
    ).toHaveClass("target:ring-2");
    const outcomeButton = screen.getByRole("button", {
      name: /worked for me too/i,
    });
    expect(outcomeButton).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /report review/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(outcomeButton);

    expect(
      screen.queryByRole("dialog", { name: /confirm product result/i }),
    ).not.toBeInTheDocument();
    expect(mockedReportReview).not.toHaveBeenCalled();
    expect(mockedSignalReviewOutcome).not.toHaveBeenCalled();
  });
});

describe("community publish forms", () => {
  it("submits TanStack/Zod-backed review and routine forms from separate posting tabs", async () => {
    mockedCreateReview.mockResolvedValue({
      moderationStatus: "pending_review",
      safetyFlags: [],
    });
    mockedCreateRoutine.mockResolvedValue({
      ...routineFixture,
      moderationStatus: "published",
    });

    const onReviewSaved = jest.fn();
    const reviewRender = renderWithProviders(
      <WriteReviewPanel
        eligibility={eligiblePosting}
        onExplainBlocked={jest.fn()}
        onSaved={onReviewSaved}
      />,
    );
    const reviewContainer = reviewRender.container;

    const reviewedProductSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="selectedShelfProductId"]',
      );
    const reviewBodyInput = reviewContainer.querySelector<HTMLTextAreaElement>(
      'textarea[name="body"]',
    );
    const contextUsageSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="routineContextUsage"]',
    );
    const outcomesInput = reviewContainer.querySelector<HTMLInputElement>(
      'input[name="outcomes"]',
    );
    const usageDurationSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="usageDuration"]',
      );
    const frequencySelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="frequency"]',
    );
    const routineSlotSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="routineSlot"]',
    );
    const skinResponseSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="skinResponse"]',
    );
    const repurchaseSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="repurchase"]',
    );
    const overallRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="overallRating"]',
      );
    const effectivenessRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="effectivenessRating"]',
      );
    const irritationRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="irritationRating"]',
      );
    if (
      !reviewedProductSelect ||
      !reviewBodyInput ||
      !contextUsageSelect ||
      !outcomesInput ||
      !usageDurationSelect ||
      !frequencySelect ||
      !routineSlotSelect ||
      !skinResponseSelect ||
      !repurchaseSelect ||
      !overallRatingSelect ||
      !effectivenessRatingSelect ||
      !irritationRatingSelect
    ) {
      throw new Error("Expected review form fields.");
    }
    expect(reviewedProductSelect.options[0]).toBeDisabled();
    expect(contextUsageSelect.options[0]).toBeDisabled();

    fireEvent.change(reviewedProductSelect, {
      target: { value: "product-cream" },
    });
    fireEvent.change(contextUsageSelect, {
      target: { value: "with_products" },
    });
    const contextProductSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="routineContext.0.productId"]',
      );
    if (!contextProductSelect) {
      throw new Error("Expected paired product row after choosing context.");
    }
    fireEvent.change(contextProductSelect, {
      target: { value: "product-cleanser" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /add another product/i }),
    );
    const secondContextSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="routineContext.1.productId"]',
      );
    if (!secondContextSelect) {
      throw new Error("Expected second paired product row.");
    }
    fireEvent.change(secondContextSelect, {
      target: { value: "product-toner" },
    });
    fireEvent.change(outcomesInput, {
      target: { value: "helped-overall" },
    });
    fireEvent.change(usageDurationSelect, {
      target: { value: "8-weeks" },
    });
    fireEvent.change(frequencySelect, {
      target: { value: "daily" },
    });
    fireEvent.change(routineSlotSelect, {
      target: { value: "pm" },
    });
    fireEvent.change(skinResponseSelect, {
      target: { value: "improved" },
    });
    fireEvent.change(repurchaseSelect, {
      target: { value: "yes" },
    });
    fireEvent.change(overallRatingSelect, {
      target: { value: "5" },
    });
    fireEvent.change(effectivenessRatingSelect, {
      target: { value: "4" },
    });
    fireEvent.change(irritationRatingSelect, {
      target: { value: "1" },
    });
    fireEvent.change(reviewBodyInput, {
      target: { value: "Worked nicely alongside a simple cleanser." },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /submit review/i }),
    );
    // Creating a review now requires confirming the editability warning
    // before the mutation fires.
    const reviewConfirmDialog = await screen.findByRole("alertdialog", {
      name: /submit this review/i,
    });
    await userEvent.click(
      within(reviewConfirmDialog).getByRole("button", {
        name: /submit review/i,
      }),
    );

    await waitFor(() => expect(mockedCreateReview).toHaveBeenCalled());
    await waitFor(() => expect(onReviewSaved).toHaveBeenCalledTimes(1));
    expect(mockedCreateReview.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        productBrand: "Ritora",
        productCategory: "moisturizer",
        productName: "Barrier Cream",
        usageDuration: "8-weeks",
        frequency: "daily",
        routineSlot: "pm",
        skinResponse: "improved",
        overallRating: 5,
        effectivenessRating: 4,
        irritationRating: 1,
        outcomes: ["helped-overall"],
        routineContextUsage: "with_products",
        routineContext: [
          {
            category: "cleanser",
            productId: "product-cleanser",
            productBrand: "Ritora",
            productName: "Milky Cleanser",
          },
          {
            category: "toner",
            productId: "product-toner",
            productBrand: "Ritora",
            productName: "Calm Toner",
          },
        ],
        productId: "product-cream",
      }),
    );

    reviewRender.unmount();

    const onPlaybookSaved = jest.fn();
    const routineRender = renderWithProviders(
      <ShareWhatWorkedPanel
        eligibility={eligiblePosting}
        onExplainBlocked={jest.fn()}
        onSaved={onPlaybookSaved}
      />,
    );
    const routineContainer = routineRender.container;

    const routineTitleInput = routineContainer.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const routineProductSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.0.productId"]',
      );
    const routineGoalSelect = routineContainer.querySelector<HTMLSelectElement>(
      'select[name="goal"]',
    );
    const routineResultSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="goalResult"]',
      );
    const routineTimeframeSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="timeframe"]',
      );
    const routineFrequencySelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.0.frequency"]',
      );
    const routineSummaryInput =
      routineContainer.querySelector<HTMLTextAreaElement>(
        'textarea[name="summary"]',
      );
    if (
      !routineTitleInput ||
      !routineProductSelect ||
      !routineGoalSelect ||
      !routineResultSelect ||
      !routineTimeframeSelect ||
      !routineFrequencySelect ||
      !routineSummaryInput
    ) {
      throw new Error("Expected routine form fields.");
    }

    fireEvent.change(routineTitleInput, {
      target: { value: "What repaired my barrier" },
    });
    fireEvent.change(routineProductSelect, {
      target: { value: "product-cleanser" },
    });
    fireEvent.change(routineGoalSelect, {
      target: { value: "barrier-repair" },
    });
    fireEvent.change(routineTimeframeSelect, {
      target: { value: "6-months" },
    });
    fireEvent.change(routineFrequencySelect, {
      target: { value: "daily" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /add another step/i }),
    );
    const secondStepSelect = routineContainer.querySelector<HTMLSelectElement>(
      'select[name="steps.1.productId"]',
    );
    const secondFrequencySelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.1.frequency"]',
      );
    if (!secondStepSelect || !secondFrequencySelect) {
      throw new Error("Expected second playbook step fields.");
    }
    fireEvent.change(secondStepSelect, {
      target: { value: "product-cream" },
    });
    fireEvent.change(secondFrequencySelect, {
      target: { value: "daily" },
    });
    fireEvent.change(routineSummaryInput, {
      target: { value: "Keep the first step gentle and boring." },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /share playbook/i }),
    );
    // Same confirmation step for the playbook composer.
    const playbookConfirmDialog = await screen.findByRole("alertdialog", {
      name: /share this playbook/i,
    });
    await userEvent.click(
      within(playbookConfirmDialog).getByRole("button", {
        name: /share playbook/i,
      }),
    );

    await waitFor(() => expect(mockedCreateRoutine).toHaveBeenCalled());
    await waitFor(() => expect(onPlaybookSaved).toHaveBeenCalledTimes(1));
    expect(mockedCreateRoutine.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        title: "What repaired my barrier",
        concernTags: ["barrier-repair"],
        goalTags: ["barrier-repair"],
        goalResult: null,
        timeframe: "6-months",
        avoidTags: [],
        summary: "Keep the first step gentle and boring.",
        steps: [
          expect.objectContaining({
            productId: "product-cleanser",
            slot: "pm",
            category: "cleanser",
            frequency: "daily",
            productBrand: "Ritora",
            productName: "Milky Cleanser",
          }),
          expect.objectContaining({
            productId: "product-cream",
            slot: "pm",
            category: "moisturizer",
            frequency: "daily",
            productBrand: "Ritora",
            productName: "Barrier Cream",
          }),
        ],
      }),
    );
  });

  it("keeps manual playbook step fields aligned after removing earlier steps", async () => {
    renderWithProviders(
      <ShareWhatWorkedPanel
        eligibility={eligiblePosting}
        onExplainBlocked={jest.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /add another step/i }),
    );

    const secondStepSelect = document.querySelector<HTMLSelectElement>(
      'select[name="steps.1.productId"]',
    );
    if (!secondStepSelect) {
      throw new Error("Expected second playbook step product picker.");
    }

    fireEvent.change(secondStepSelect, {
      target: { value: "__other__" },
    });

    const secondBrandInput = document.querySelector<HTMLInputElement>(
      'input[name="steps.1.productBrand"]',
    );
    const secondProductInput = document.querySelector<HTMLInputElement>(
      'input[name="steps.1.productName"]',
    );
    if (!secondBrandInput || !secondProductInput) {
      throw new Error("Expected manual product fields for second step.");
    }

    fireEvent.change(secondBrandInput, {
      target: { value: "Manual Brand" },
    });
    fireEvent.change(secondProductInput, {
      target: { value: "Manual Cream" },
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Remove step 1" }),
    );

    const shiftedBrandInput = document.querySelector<HTMLInputElement>(
      'input[name="steps.0.productBrand"]',
    );
    const shiftedProductInput = document.querySelector<HTMLInputElement>(
      'input[name="steps.0.productName"]',
    );

    expect(shiftedBrandInput).toHaveValue("Manual Brand");
    expect(shiftedProductInput).toHaveValue("Manual Cream");
  });
});

describe("CommunityRoutineDetailPage", () => {
  it("checks a routine against the shelf without offering to save the check", async () => {
    mockedGetRoutine.mockResolvedValue(routineFixture);
    mockedAdaptRoutine.mockResolvedValue(adaptationFixture);

    renderWithProviders(<CommunityRoutineDetailPage routineId="routine-1" />);

    expect(
      await screen.findByRole("heading", { name: "Quiet AM barrier routine" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add sunscreen when using photosensitizing actives."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /report/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /check my shelf/i }),
    );

    expect(await screen.findByText("Already owned")).toBeInTheDocument();
    expect(screen.getByText("Owned alternatives")).toBeInTheDocument();
    expect(screen.getByText("Skipped for safety")).toBeInTheDocument();
    expect(screen.getByText("Missing categories")).toBeInTheDocument();
    expect(screen.getByText("Ritora Calm Cream")).toBeInTheDocument();
    expect(
      screen.getByText("A sunscreen category gap remains."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
    expect(mockedReportRoutine).not.toHaveBeenCalled();
  });

  it("shows a retry panel when a routine is unavailable", async () => {
    mockedGetRoutine.mockRejectedValueOnce(new Error("Hidden"));

    renderWithProviders(<CommunityRoutineDetailPage routineId="routine-404" />);

    expect(
      await screen.findByText("Routine could not load"),
    ).toBeInTheDocument();
  });
});

describe("MySubmissions", () => {
  it("uses automatic pagination for the Mine tab", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [submissionsFixture[0]],
      nextCursor: "cursor-1",
    });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByRole("heading", { name: "My submissions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("community-submissions-auto-load-sentinel"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
  });

  it("edits returned playbooks with the full structured form", async () => {
    mockUseShelfProducts.mockReturnValue({
      data: [
        {
          id: "product-cream",
          identity: {
            brand: "Ritora",
            category: "moisturizer",
            name: "Barrier Cream",
          },
        },
      ],
      isLoading: false,
    });
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });
    mockedUpdateRoutine.mockResolvedValue(routineFixture);

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByRole("heading", { name: "My submissions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remove treatment claims before resubmitting."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("What to edit").length).toBeGreaterThan(0);
    expect(screen.getByText("Automated moderation")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "Change the parts called out, then save edits. Resubmit unchanged only if you believe this was a mistake.",
      ).length,
    ).toBeGreaterThan(0);

    const routineCard = screen
      .getByText("Needs safer routine")
      .closest("article");
    if (!routineCard) throw new Error("Expected routine submission card.");

    await userEvent.click(
      within(routineCard).getByRole("button", { name: "Edit" }),
    );
    const playbookDialog = await screen.findByRole("dialog", {
      name: "Edit playbook",
    });
    const titleInput = playbookDialog.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const lifestyleInput = playbookDialog.querySelector<HTMLTextAreaElement>(
      'textarea[name="summary"]',
    );
    const timeframeSelect = playbookDialog.querySelector<HTMLSelectElement>(
      'select[name="timeframe"]',
    );
    const selectedStepProduct = playbookDialog.querySelector<HTMLSelectElement>(
      'select[name="steps.0.productId"]',
    );
    if (
      !titleInput ||
      !lifestyleInput ||
      !timeframeSelect ||
      !selectedStepProduct
    ) {
      throw new Error("Expected structured editable routine fields.");
    }
    expect(selectedStepProduct.value).toBe("product-cleanser");
    expect(selectedStepProduct.textContent).toContain("Ritora Milky Cleanser");

    fireEvent.change(titleInput, {
      target: { value: "Updated safer routine" },
    });
    fireEvent.change(lifestyleInput, {
      target: { value: "Removed treatment claims and kept it practical." },
    });
    fireEvent.change(timeframeSelect, {
      target: { value: "3-months" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save edits" }));

    await waitFor(() =>
      expect(mockedUpdateRoutine).toHaveBeenCalledWith(
        "submission-routine",
        expect.objectContaining({
          title: "Updated safer routine",
          summary: "Removed treatment claims and kept it practical.",
          timeframe: "3-months",
          disclosureType: "ordinary",
          goalTags: ["acne"],
          steps: [
            expect.objectContaining({
              productId: "product-cleanser",
              productBrand: "Ritora",
              productName: "Milky Cleanser",
              category: "cleanser",
              frequency: "daily",
              slot: "pm",
            }),
          ],
        }),
      ),
    );
  });

  it("guards unsaved playbook edits before closing the edit sheet", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });

    renderWithProviders(<MySubmissions />);

    const routineCard = (
      await screen.findByText("Needs safer routine")
    ).closest("article");
    if (!routineCard) throw new Error("Expected routine submission card.");

    await userEvent.click(
      within(routineCard).getByRole("button", { name: "Edit" }),
    );
    const playbookDialog = await screen.findByRole("dialog", {
      name: "Edit playbook",
    });
    const titleInput = playbookDialog.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    if (!titleInput) {
      throw new Error("Expected editable playbook title field.");
    }

    fireEvent.change(titleInput, {
      target: { value: "Updated safer routine" },
    });
    await userEvent.click(
      within(playbookDialog).getByRole("button", { name: "Close" }),
    );

    const discardDialog = await screen.findByRole("alertdialog", {
      name: "Discard playbook changes?",
    });
    await userEvent.click(
      within(discardDialog).getByRole("button", { name: "Keep editing" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Edit playbook" }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(playbookDialog).getByRole("button", { name: "Close" }),
    );
    await userEvent.click(
      within(
        await screen.findByRole("alertdialog", {
          name: "Discard playbook changes?",
        }),
      ).getByRole("button", { name: "Discard changes" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Edit playbook" }),
      ).not.toBeInTheDocument(),
    );
    expect(mockedUpdateRoutine).not.toHaveBeenCalled();
  });

  it("falls back to safety flags when returned playbooks have no moderation note", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[0],
          moderationGuidance: null,
        },
      ],
    });

    renderWithProviders(<MySubmissions />);

    expect(await screen.findByText("What to edit")).toBeInTheDocument();
    expect(screen.getByText("Safety review")).toBeInTheDocument();
    expect(
      screen.getByText("Remove treatment claims before resubmitting."),
    ).toBeInTheDocument();
  });

  it("shows a generic edit reason when returned content has no note or flag", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[0],
          moderationGuidance: null,
          safetyFlags: [],
        },
      ],
    });

    renderWithProviders(<MySubmissions />);

    expect(await screen.findByText("What to edit")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review this submission for unsafe claims, missing routine context, or disclosure issues before saving edits.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the reviewed product name as the Mine review card title", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [submissionsFixture[1]],
    });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Rejected review" }),
    ).not.toBeInTheDocument();
  });

  it("edits returned reviews with shelf product context and resubmits unchanged content", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });
    mockedUpdateReview.mockResolvedValue(reviewFixture);
    mockedResubmit.mockResolvedValue(submissionsFixture[1]);

    renderWithProviders(<MySubmissions />);

    const reviewCard = (
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" })
    ).closest("article");
    if (!reviewCard) throw new Error("Expected review submission card.");
    expect(
      within(reviewCard).getByText(
        "Add sunscreen context and clarify the claim wording.",
      ),
    ).toBeInTheDocument();
    expect(
      within(reviewCard).getByText("Ritora moderation"),
    ).toBeInTheDocument();

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Edit" }),
    );
    const reviewDialog = await screen.findByRole("dialog", {
      name: "Edit review",
    });
    const selectedReviewProduct = reviewDialog.querySelector<HTMLSelectElement>(
      'select[name="selectedShelfProductId"]',
    );
    const selectedContextUsage = reviewDialog.querySelector<HTMLSelectElement>(
      'select[name="routineContextUsage"]',
    );
    const selectedContextProduct =
      reviewDialog.querySelector<HTMLSelectElement>(
        'select[name="routineContext.0.productId"]',
      );
    const outcomesInput = reviewDialog.querySelector<HTMLInputElement>(
      'input[name="outcomes"]',
    );
    const ratingSelect = reviewDialog.querySelector<HTMLSelectElement>(
      'select[name="overallRating"]',
    );
    if (
      !selectedReviewProduct ||
      !selectedContextUsage ||
      !selectedContextProduct ||
      !outcomesInput ||
      !ratingSelect
    ) {
      throw new Error("Expected structured editable review fields.");
    }
    expect(selectedReviewProduct.value).toBe("product-cream");
    expect(selectedContextUsage.value).toBe("with_products");
    expect(selectedContextProduct.value).toBe("product-cleanser");

    fireEvent.change(outcomesInput, {
      target: { value: "calmer, less stinging, smoother" },
    });
    fireEvent.change(ratingSelect, { target: { value: "5" } });
    await userEvent.click(screen.getByRole("button", { name: "Save edits" }));

    await waitFor(() =>
      expect(mockedUpdateReview).toHaveBeenCalledWith(
        "submission-review",
        expect.objectContaining({
          productBrand: "Ritora",
          productName: "Barrier Cream",
          productId: "product-cream",
          overallRating: 5,
          outcomes: ["calmer", "less stinging", "smoother"],
          routineContextUsage: "with_products",
          routineContext: [
            expect.objectContaining({
              productId: "product-cleanser",
              productBrand: "Ritora",
              productName: "Milky Cleanser",
            }),
          ],
        }),
      ),
    );

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Resubmit unchanged" }),
    );
    expect(mockedResubmit).toHaveBeenCalledWith("submission-review");
  });

  it("guards unsaved review edits before closing the edit sheet", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });

    renderWithProviders(<MySubmissions />);

    const reviewCard = (
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" })
    ).closest("article");
    if (!reviewCard) throw new Error("Expected review submission card.");

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Edit" }),
    );
    const reviewDialog = await screen.findByRole("dialog", {
      name: "Edit review",
    });
    const outcomesInput = reviewDialog.querySelector<HTMLInputElement>(
      'input[name="outcomes"]',
    );
    if (!outcomesInput) {
      throw new Error("Expected editable review outcomes field.");
    }

    fireEvent.change(outcomesInput, {
      target: { value: "calmer, less stinging, smoother" },
    });
    await userEvent.click(
      within(reviewDialog).getByRole("button", { name: "Close" }),
    );

    const discardDialog = await screen.findByRole("alertdialog", {
      name: "Discard review changes?",
    });
    await userEvent.click(
      within(discardDialog).getByRole("button", { name: "Keep editing" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Edit review" }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(reviewDialog).getByRole("button", { name: "Close" }),
    );
    await userEvent.click(
      within(
        await screen.findByRole("alertdialog", {
          name: "Discard review changes?",
        }),
      ).getByRole("button", { name: "Discard changes" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Edit review" }),
      ).not.toBeInTheDocument(),
    );
    expect(mockedUpdateReview).not.toHaveBeenCalled();
  });

  it("offers withdrawal instead of editing for published submissions", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[0],
          id: "submission-published",
          title: "Published playbook",
          status: "published",
          safetyFlags: [],
        },
        {
          ...submissionsFixture[1],
          id: "submission-published-review",
          title: "Published review",
          status: "published",
          safetyFlags: [],
          moderationGuidance: null,
        },
      ],
    });
    mockedWithdraw.mockResolvedValue({ deleted: true });

    renderWithProviders(<MySubmissions />);

    const publishedCard = (
      await screen.findByText("Published playbook")
    ).closest("article");
    if (!publishedCard) throw new Error("Expected published submission card.");

    expect(
      within(publishedCard).queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      within(publishedCard).getByRole("link", { name: "View playbook" }),
    ).toHaveAttribute(
      "href",
      "/community?tab=routines#community-routine-submission-published",
    );

    const publishedReviewCard = (
      await screen.findByRole("heading", { name: "Ritora Barrier Cream" })
    ).closest("article");
    if (!publishedReviewCard) {
      throw new Error("Expected published review submission card.");
    }
    expect(screen.queryByText("Published review")).not.toBeInTheDocument();
    expect(
      within(publishedReviewCard).getByRole("link", { name: "View review" }),
    ).toHaveAttribute(
      "href",
      "/community?tab=reviews#community-review-submission-published-review",
    );

    await userEvent.click(
      within(publishedCard).getByRole("button", { name: "Withdraw" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Withdraw community submission?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Withdraw" }),
    );

    await waitFor(() =>
      expect(mockedWithdraw).toHaveBeenCalledWith("submission-published"),
    );
    expect(mockedToast.success).toHaveBeenCalledWith(
      "Submission withdrawn from community evidence.",
    );
  });

  it("shows result notes with a link back to the original review and withdrawal", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [submissionsFixture[2]],
    });
    mockedWithdraw.mockResolvedValue({ deleted: true });

    renderWithProviders(<MySubmissions />);

    const resultCard = (
      await screen.findByRole("heading", {
        name: "The Ordinary Azelaic Acid Suspension 10%",
      })
    ).closest("article");
    if (!resultCard) throw new Error("Expected result submission card.");

    expect(
      within(resultCard).getByText("Result on review"),
    ).toBeInTheDocument();
    expect(
      within(resultCard).getByText(
        "Buffering with moisturizer made it easier to keep using.",
      ),
    ).toBeInTheDocument();
    const reviewLink = within(resultCard).getByRole("link", {
      name: "View review",
    });
    expect(reviewLink).toHaveAttribute(
      "href",
      "/community?tab=reviews#community-review-review-1",
    );
    expect(
      within(resultCard).queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(resultCard).getByRole("button", { name: "Withdraw" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Withdraw community submission?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Withdraw" }),
    );

    await waitFor(() =>
      expect(mockedWithdraw).toHaveBeenCalledWith("submission-result"),
    );
  });

  it("does not use an outcome signal enum as a missing result parent title", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[2],
          title: "did_not_work",
          parentContent: null,
          resultSignal: "did_not_work",
        },
      ],
    });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByRole("heading", { name: "Untitled product" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("did_not_work")).not.toBeInTheDocument();
  });

  it("shows when a result note parent review is under moderation and hides the view link", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[2],
          parentContent: {
            id: "review-flagged",
            status: "pending_review",
            title: "The Ordinary Azelaic Acid Suspension 10%",
            type: "review",
          },
        },
      ],
    });

    renderWithProviders(<MySubmissions />);

    const resultCard = (
      await screen.findByRole("heading", {
        name: "The Ordinary Azelaic Acid Suspension 10%",
      })
    ).closest("article");
    if (!resultCard) throw new Error("Expected result submission card.");

    /* The parent-moderation notice was compacted from a
       full title+body block to a one-line strip that
       carries the body only. The body alone is still
       enough context for the user (the strip's tone +
       icon convey severity) and saves ~50px of card
       chrome. */
    expect(
      within(resultCard).getByText(
        "Your result note is saved, but this review is not visible publicly while Ritora reviews it.",
      ),
    ).toBeInTheDocument();
    expect(
      within(resultCard).queryByRole("link", { name: "View review" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when the user has no submissions", async () => {
    mockedListSubmissions.mockResolvedValue({ items: [] });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByText("No community submissions yet"),
    ).toBeInTheDocument();
  });
});
