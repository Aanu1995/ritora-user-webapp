import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import type {
  SuggestionHistoryDay,
  SuggestionHistoryListResponse,
} from "@/types/suggestions";

const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();
const intersectionObservers: MockIntersectionObserverInstance[] = [];

type MockIntersectionObserverInstance = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  observe: jest.Mock<void, [Element]>;
  disconnect: jest.Mock<void, []>;
};

function installIntersectionObserverMock() {
  intersectionObservers.length = 0;

  class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];
    private readonly instance: MockIntersectionObserverInstance;

    constructor(callback: IntersectionObserverCallback) {
      this.instance = {
        callback,
        elements: new Set<Element>(),
        observe: jest.fn((element: Element) => {
          this.instance.elements.add(element);
        }),
        disconnect: jest.fn(() => {
          this.instance.elements.clear();
        }),
      };
      intersectionObservers.push(this.instance);
    }

    observe = (element: Element) => this.instance.observe(element);
    disconnect = () => this.instance.disconnect();
    unobserve = jest.fn();
    takeRecords = () => [];
  }

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

function triggerIntersection(testId: string) {
  const target = screen.getByTestId(testId);
  const observer = intersectionObservers.at(-1);
  if (!observer) {
    throw new Error("No IntersectionObserver instance was registered.");
  }

  observer.callback(
    [
      {
        isIntersecting: true,
        target,
        time: 0,
        intersectionRatio: 1,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
      } as IntersectionObserverEntry,
    ],
    {} as IntersectionObserver,
  );
}

let mockHistoryState = historyHookState();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useSuggestionHistory: () => mockHistoryState,
}));

jest.mock("@/services/suggestions.service", () => ({
  exportSuggestionHistoryCsv: jest.fn(),
}));

import HistoryPage from "@/app/(app)/history/page";

describe("HistoryPage", () => {
  beforeEach(() => {
    installIntersectionObserverMock();
    mockFetchNextPage.mockReset();
    mockRefetch.mockReset();
    mockHistoryState = historyHookState();
  });

  it("loads more history automatically when the scroll sentinel enters view", () => {
    renderWithProviders(<HistoryPage />);

    expect(
      screen.queryByRole("button", { name: /^load more$/i }),
    ).not.toBeInTheDocument();

    triggerIntersection("history-auto-load-sentinel");

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it("keeps a retry button only for failed next-page loads", async () => {
    const user = userEvent.setup();
    mockHistoryState = historyHookState({
      isFetchNextPageError: true,
    });

    renderWithProviders(<HistoryPage />);

    expect(
      screen.queryByRole("button", { name: /^load more$/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(mockFetchNextPage).toHaveBeenCalled();
  });
});

function historyHookState(
  overrides: Partial<ReturnType<typeof baseHistoryState>> = {},
) {
  return {
    ...baseHistoryState(),
    ...overrides,
  };
}

function baseHistoryState() {
  return {
    data: historyResponse(),
    isLoading: false,
    isError: false,
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: mockFetchNextPage,
    refetch: mockRefetch,
  };
}

function historyResponse(): SuggestionHistoryListResponse {
  return {
    days: [historyDay()],
    nextCursor: "cursor-2",
    totalApplied: 1,
    totalSlots: 1,
    totalEdited: 0,
    adherencePercent: 100,
  };
}

function historyDay(): SuggestionHistoryDay {
  return {
    date: "2026-05-03",
    weatherSummary: null,
    moodScore: 4,
    hydrationTrend: "flat",
    reactionFlagged: false,
    photoEntryId: null,
    slots: [
      {
        slotId: "slot-1",
        suggestionId: "suggestion-1",
        applicationLogId: "log-1",
        daypart: "morning",
        slotTime: "08:00",
        mode: "ai",
        appliedCount: 1,
        totalSteps: 1,
        status: "applied",
        hasBeenEdited: false,
        summaryLine: "1 of 1 applied. Matches the suggestion.",
        suggestion: null,
        applicationLog: null,
      },
    ],
  };
}
