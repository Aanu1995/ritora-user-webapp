import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import type { InAppNotification } from "@/types/notifications";

const mockFetchNextPage = jest.fn();
const mockMarkAll = jest.fn();
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

let mockUnreadNotifications: InAppNotification[] = [];
let mockReadNotifications: InAppNotification[] = [];
let mockUnreadCount = 0;

function notification(
  id: string,
  readAt: string | null,
  kind: InAppNotification["kind"] = "photo_reminder",
  payload: InAppNotification["payload"] = null,
): InAppNotification {
  return {
    id,
    kind,
    title_key: "skinJournal.notifications.photoReminder.title",
    body_key: "skinJournal.notifications.photoReminder.body",
    severity: "info",
    payload,
    deep_link: "/journal/upload",
    read_at: readAt,
    created_at: "2026-04-29T08:00:00.000Z",
  };
}

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    data: {
      unread: mockUnreadNotifications,
      read: mockReadNotifications,
      unread_count: mockUnreadCount,
    },
    isPending: false,
    isError: false,
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: mockFetchNextPage,
    refetch: jest.fn(),
  }),
  useMarkAllNotificationsRead: () => ({
    mutate: mockMarkAll,
    isPending: false,
  }),
  useMarkNotificationRead: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

import NotificationsPage from "@/app/(app)/notifications/page";

describe("NotificationsPage", () => {
  beforeEach(() => {
    installIntersectionObserverMock();
    mockUnreadNotifications = [notification("unread-1", null)];
    mockReadNotifications = [
      notification("read-1", "2026-04-29T09:00:00.000Z"),
    ];
    mockUnreadCount = 2;
    mockFetchNextPage.mockReset();
    mockMarkAll.mockReset();
  });

  it("auto-loads the next notifications cursor page when the sentinel enters view", () => {
    renderWithProviders(<NotificationsPage />);

    triggerIntersection("notifications-auto-load-sentinel");

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it("renders unread and read buckets from paginated API data", () => {
    renderWithProviders(<NotificationsPage />);

    expect(screen.getByText(/unread · 2/i)).toBeInTheDocument();
    expect(screen.getByText(/read · 1/i)).toBeInTheDocument();
  });

  it("labels Today's Suggestion notifications with the suggestion source", () => {
    mockUnreadNotifications = [
      notification("suggestion-1", null, "suggestion_ready"),
    ];
    mockReadNotifications = [];
    mockUnreadCount = 1;

    renderWithProviders(<NotificationsPage />);

    expect(screen.getByText(/today's suggestion/i)).toBeInTheDocument();
    expect(screen.queryByText(/^skin journal$/i)).not.toBeInTheDocument();
  });

  it("renders product expiry notifications with shelf source and payload copy", () => {
    mockUnreadNotifications = [
      notification("product-1", null, "product_nearing_expiry", {
        productName: "CeraVe Retinol Serum",
        expiresAt: "2026-05-10T00:00:00.000Z",
        daysUntilExpiry: 9,
      }),
    ];
    mockReadNotifications = [];
    mockUnreadCount = 1;

    renderWithProviders(<NotificationsPage />);

    expect(screen.getByText(/shelf/i)).toBeInTheDocument();
    expect(screen.getByText(/cerave retinol serum/i)).toBeInTheDocument();
    expect(screen.getByText(/9 days/i)).toBeInTheDocument();
  });

  it("renders the notification preferences action in the populated header", () => {
    renderWithProviders(<NotificationsPage />);

    const preferencesLink = screen.getByRole("link", {
      name: /preferences/i,
    });

    expect(preferencesLink).toHaveAttribute("href", NOTIFICATION_SETTINGS_ROUTE);
  });
});
