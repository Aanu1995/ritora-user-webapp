import { readFileSync } from "fs";
import { join } from "path";
import { runInNewContext } from "vm";

type ServiceWorkerTestEvent = {
  data?: {
    json: () => unknown;
  };
  notification?: {
    close: () => void;
    data?: {
      deepLink?: string;
    };
  };
  waitUntil: (promise: Promise<unknown>) => void;
};

type ServiceWorkerListeners = Partial<
  Record<"push" | "notificationclick", (event: ServiceWorkerTestEvent) => void>
>;

describe("push service worker", () => {
  it("shows push notifications from provider payloads", async () => {
    const worker = loadPushServiceWorker();
    const waitUntil = jest.fn();

    worker.listeners.push?.({
      data: {
        json: () => ({
          title: "Product expired",
          body: "CeraVe expired today.",
          data: { deepLink: "/shelf/product-1" },
        }),
      },
      waitUntil,
    });

    await waitUntil.mock.calls[0]?.[0];

    expect(worker.registration.showNotification).toHaveBeenCalledWith(
      "Product expired",
      expect.objectContaining({
        body: "CeraVe expired today.",
        data: { deepLink: "/shelf/product-1" },
      }),
    );
  });

  it("handles null push payloads without crashing", async () => {
    const worker = loadPushServiceWorker();
    const waitUntil = jest.fn();

    worker.listeners.push?.({
      data: {
        json: () => null,
      },
      waitUntil,
    });

    await waitUntil.mock.calls[0]?.[0];

    expect(worker.registration.showNotification).toHaveBeenCalledWith(
      "Ritora",
      expect.objectContaining({
        body: "",
        data: { deepLink: "/notifications" },
      }),
    );
  });

  it("handles primitive push payloads without crashing", async () => {
    const worker = loadPushServiceWorker();
    const waitUntil = jest.fn();

    worker.listeners.push?.({
      data: {
        json: () => "not an object",
      },
      waitUntil,
    });

    await waitUntil.mock.calls[0]?.[0];

    expect(worker.registration.showNotification).toHaveBeenCalledWith(
      "Ritora",
      expect.objectContaining({
        body: "",
        data: { deepLink: "/notifications" },
      }),
    );
  });

  it("rejects remote notification icon and badge URLs", async () => {
    const worker = loadPushServiceWorker();
    const waitUntil = jest.fn();

    worker.listeners.push?.({
      data: {
        json: () => ({
          title: "Product expired",
          icon: "https://tracker.example/icon.png",
          badge: "//tracker.example/badge.png",
        }),
      },
      waitUntil,
    });

    await waitUntil.mock.calls[0]?.[0];

    expect(worker.registration.showNotification).toHaveBeenCalledWith(
      "Product expired",
      expect.objectContaining({
        icon: "/brand/ritora-icon-192.png",
        badge: "/brand/ritora-icon-192.png",
      }),
    );
  });

  it("falls back to notifications when click payload contains an external URL", async () => {
    const worker = loadPushServiceWorker();
    const waitUntil = jest.fn();
    worker.clients.matchAll.mockResolvedValue([]);
    worker.clients.openWindow.mockResolvedValue(undefined);

    worker.listeners.notificationclick?.({
      notification: {
        close: jest.fn(),
        data: { deepLink: "https://example.invalid/phishing" },
      },
      waitUntil,
    });

    await waitUntil.mock.calls[0]?.[0];

    expect(worker.clients.openWindow).toHaveBeenCalledWith(
      "https://app.ritora.test/notifications",
    );
  });
});

function loadPushServiceWorker() {
  const listeners: ServiceWorkerListeners = {};
  const registration = {
    showNotification: jest.fn().mockResolvedValue(undefined),
  };
  const clients = {
    matchAll: jest.fn().mockResolvedValue([]),
    openWindow: jest.fn(),
  };
  const self = {
    location: { origin: "https://app.ritora.test" },
    registration,
    clients,
    addEventListener: jest.fn(
      (
        type: keyof ServiceWorkerListeners,
        listener: (event: ServiceWorkerTestEvent) => void,
      ) => {
        listeners[type] = listener;
      },
    ),
  };

  runInNewContext(
    readFileSync(join(process.cwd(), "public/push-service-worker.js"), "utf8"),
    { self, URL },
  );

  return { listeners, registration, clients };
}
