jest.mock("@/services/notifications.service", () => ({
  getNotificationPreferences: jest.fn(),
  listPushSubscriptions: jest.fn(),
  registerPushSubscription: jest.fn(),
  revokePushSubscription: jest.fn(),
  updateNotificationPreferences: jest.fn(),
}));

import {
  getNotificationPreferences,
  registerPushSubscription,
  listPushSubscriptions,
  revokePushSubscription,
  updateNotificationPreferences,
} from "@/services/notifications.service";
import {
  BrowserPushErrorCode,
  getBrowserPushErrorCode,
  getBrowserPushErrorDetail,
  getBrowserPushSupportState,
  getCurrentBrowserPushSubscription,
  hashPushEndpoint,
  revokeCurrentBrowserPushSubscription,
  subscribeCurrentBrowserToPush,
} from "@/lib/browser-push";
import { PushPlatformValue, PushProviderValue } from "@/types/notifications";

const VALID_PUBLIC_KEY =
  "BFXpd5UUmbjuVtUHIv95C3Ax-fYk97DhOR2gw8R9i_U9H7-crci1M5yPO6MdYGsAI3VSa-rOfb8X8_ZXD6Z3Yks";
const mockListPushSubscriptions = listPushSubscriptions as jest.Mock;
const mockRegisterPushSubscription = registerPushSubscription as jest.Mock;
const mockRevokePushSubscription = revokePushSubscription as jest.Mock;
const mockGetNotificationPreferences = getNotificationPreferences as jest.Mock;
const mockUpdateNotificationPreferences =
  updateNotificationPreferences as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

describe("browser push subscription revocation", () => {
  beforeEach(() => {
    configureEndpointHash("abcd");
  });

  it("does not revoke backend subscriptions when this browser has no local endpoint", async () => {
    configureBrowserPushSupport(null);

    await revokeCurrentBrowserPushSubscription();

    expect(mockListPushSubscriptions).not.toHaveBeenCalled();
    expect(mockRevokePushSubscription).not.toHaveBeenCalled();
  });

  it("revokes only the backend subscription matching the current browser endpoint", async () => {
    const current = createPushSubscription("https://push.example/current");
    configureBrowserPushSupport(current);
    mockRevokePushSubscription.mockResolvedValue(undefined);
    mockListPushSubscriptions.mockResolvedValue([
      {
        id: "current-subscription",
        provider: PushProviderValue.WebPush,
        platform: PushPlatformValue.Web,
        endpoint_hash: "abcd",
      },
      {
        id: "other-browser",
        provider: PushProviderValue.WebPush,
        platform: PushPlatformValue.Web,
        endpoint_hash: "efgh",
      },
      {
        id: "mobile-token",
        provider: PushProviderValue.Fcm,
        platform: PushPlatformValue.Android,
      },
    ]);

    await revokeCurrentBrowserPushSubscription();

    expect(current.unsubscribe).toHaveBeenCalled();
    expect(mockRevokePushSubscription).toHaveBeenCalledTimes(1);
    expect(mockRevokePushSubscription).toHaveBeenCalledWith(
      "current-subscription",
    );
  });

  it("still revokes the existing subscription when notification permission is denied", async () => {
    const current = createPushSubscription("https://push.example/current");
    configureBrowserPushSupport(current, "denied");
    mockRevokePushSubscription.mockResolvedValue(undefined);
    mockListPushSubscriptions.mockResolvedValue([
      {
        id: "current-subscription",
        provider: PushProviderValue.WebPush,
        platform: PushPlatformValue.Web,
        endpoint_hash: "abcd",
      },
    ]);

    await revokeCurrentBrowserPushSubscription();

    expect(current.unsubscribe).toHaveBeenCalled();
    expect(mockRevokePushSubscription).toHaveBeenCalledWith(
      "current-subscription",
    );
  });

  it("returns early when push is unsupported or the page is insecure", async () => {
    Reflect.deleteProperty(window, "Notification");

    await revokeCurrentBrowserPushSubscription();
    expect(mockListPushSubscriptions).not.toHaveBeenCalled();

    configureBrowserPushSupport(createPushSubscription("https://push.example"));
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });

    await revokeCurrentBrowserPushSubscription();
    expect(mockListPushSubscriptions).not.toHaveBeenCalled();
  });

  it("can disable the push channel when the browser subscription was the last one", async () => {
    const current = createPushSubscription("https://push.example/current");
    configureBrowserPushSupport(current);
    mockListPushSubscriptions
      .mockResolvedValueOnce([
        {
          id: "current-subscription",
          provider: PushProviderValue.WebPush,
          platform: PushPlatformValue.Web,
          endpoint_hash: "abcd",
        },
      ])
      .mockResolvedValueOnce([]);
    mockGetNotificationPreferences.mockResolvedValue({
      channels: ["email", "push"],
    });
    mockUpdateNotificationPreferences.mockResolvedValue(undefined);

    await revokeCurrentBrowserPushSubscription({
      disablePushChannelWhenNoSubscriptionsRemain: true,
    });

    expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith({
      channels: ["email"],
    });
  });
});

describe("browser push subscription setup", () => {
  beforeEach(() => {
    configureEndpointHash("abcd");
  });

  it("throws a specific error when the backend public key is missing", async () => {
    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
    });

    await expect(subscribeCurrentBrowserToPush("")).rejects.toMatchObject({
      code: BrowserPushErrorCode.MissingPublicKey,
    });
  });

  it("reports support state and current subscription conservatively", async () => {
    Reflect.deleteProperty(window, "Notification");
    expect(getBrowserPushSupportState()).toBe("unsupported");
    await expect(getCurrentBrowserPushSubscription()).resolves.toBeNull();

    configureBrowserPushSupport(null, "denied");
    expect(getBrowserPushSupportState()).toBe("denied");

    const current = createPushSubscription("https://push.example/current");
    configureBrowserPushSupport(current);
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });
    expect(getBrowserPushSupportState()).toBe("insecure");
    await expect(getCurrentBrowserPushSubscription()).resolves.toBeNull();

    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    await expect(getCurrentBrowserPushSubscription()).resolves.toBe(current);
  });

  it("maps denied, insecure, and unsupported setup attempts before registering", async () => {
    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
      permission: "denied",
    });
    await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).rejects.toMatchObject({
      code: BrowserPushErrorCode.PermissionDenied,
    });

    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
      requestPermission: "denied",
    });
    await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).rejects.toMatchObject({
      code: BrowserPushErrorCode.PermissionDenied,
    });

    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });
    await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).rejects.toMatchObject({
      code: BrowserPushErrorCode.InsecureContext,
    });

    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Reflect.deleteProperty(window, "Notification");
    await expect(
      subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY),
    ).rejects.toMatchObject({
      code: BrowserPushErrorCode.Unsupported,
    });
  });

  it("throws a specific error when the backend public key is invalid", async () => {
    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
    });

    await expect(subscribeCurrentBrowserToPush("not-a-vapid-key")).rejects.toMatchObject({
      code: BrowserPushErrorCode.InvalidPublicKey,
    });

    expect(mockRegisterPushSubscription).not.toHaveBeenCalled();
  });

  it("waits for the active service worker and passes the VAPID key as bytes", async () => {
    const created = createPushSubscription("https://push.example/current");
    const { register, subscribe } = configureBrowserPushRegistration({
      existing: null,
      created,
    });
    mockRegisterPushSubscription.mockResolvedValue({ id: "sub-1" });

    await subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY);

    expect(register).toHaveBeenCalledWith("/push-service-worker.js");
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      }),
    );
    const subscribeOptions = subscribe.mock.calls[0]?.[0] as
      | PushSubscriptionOptionsInit
      | undefined;
    expect(subscribeOptions?.applicationServerKey).toBeInstanceOf(Uint8Array);
    expect(
      (subscribeOptions?.applicationServerKey as Uint8Array | undefined)
        ?.byteLength,
    ).toBe(65);
  });

  it("registers an existing subscription without creating a duplicate", async () => {
    const existing = createPushSubscription("https://push.example/current");
    const { subscribe } = configureBrowserPushRegistration({
      existing,
      created: createPushSubscription("https://push.example/new"),
    });
    mockRegisterPushSubscription.mockResolvedValue({ id: "sub-1" });

    await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).resolves.toEqual(
      expect.objectContaining({
        endpoint: "https://push.example/current",
      }),
    );

    expect(subscribe).not.toHaveBeenCalled();
  });

  it("maps incomplete subscriptions and browser subscribe failures to safe error codes", async () => {
    configureBrowserPushRegistration({
      existing: createIncompletePushSubscription(),
      created: createPushSubscription("https://push.example/new"),
    });
    await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).rejects.toMatchObject({
      code: BrowserPushErrorCode.IncompleteSubscription,
    });

    for (const [name, expected] of [
      ["NotAllowedError", BrowserPushErrorCode.PermissionDenied],
      ["SecurityError", BrowserPushErrorCode.InsecureContext],
      ["NotSupportedError", BrowserPushErrorCode.Unsupported],
      ["OtherError", BrowserPushErrorCode.SubscriptionFailed],
    ] as const) {
      configureBrowserPushRegistration({
        existing: null,
        created: createPushSubscription("https://push.example/current"),
        subscribeError: Object.assign(new Error("browser failed"), { name }),
      });

      await expect(subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY)).rejects.toMatchObject({
        code: expected,
        detail: "browser failed",
      });
    }
  });

  it("maps browser invalid-key subscription failures to a specific error", async () => {
    configureBrowserPushRegistration({
      existing: null,
      created: createPushSubscription("https://push.example/current"),
      subscribeError: Object.assign(
        new Error("The provided applicationServerKey is not valid."),
        { name: "InvalidAccessError" },
      ),
    });

    await expect(
      subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY),
    ).rejects.toMatchObject({
      code: BrowserPushErrorCode.InvalidPublicKey,
    });
  });

  it("cleans up a newly created browser subscription when backend registration fails", async () => {
    const created = createPushSubscription("https://push.example/current");
    configureBrowserPushRegistration({ existing: null, created });
    mockRegisterPushSubscription.mockRejectedValue(new Error("server down"));

    await expect(
      subscribeCurrentBrowserToPush(VALID_PUBLIC_KEY),
    ).rejects.toMatchObject({
      code: BrowserPushErrorCode.BackendRegistrationFailed,
      detail: "server down",
    });

    expect(created.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("extracts browser push error codes, details, hashes, and device labels safely", async () => {
    expect(getBrowserPushErrorCode({ code: BrowserPushErrorCode.Unsupported })).toBe(
      BrowserPushErrorCode.Unsupported,
    );
    expect(getBrowserPushErrorCode({ code: "bad-code" })).toBeNull();
    expect(getBrowserPushErrorCode(null)).toBeNull();
    expect(getBrowserPushErrorDetail({ detail: "  server down  " })).toBe(
      "  server down  ",
    );
    expect(getBrowserPushErrorDetail({ detail: "   " })).toBeNull();

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });
    await expect(hashPushEndpoint("https://push.example")).resolves.toBeNull();
    configureEndpointHash("abcd");
    await expect(hashPushEndpoint(null)).resolves.toBeNull();
    await expect(hashPushEndpoint("https://push.example")).resolves.toBe("abcd");
  });
});

function configureBrowserPushSupport(
  subscription: PushSubscription | null,
  permission: NotificationPermission = "granted",
) {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: {
      permission,
      requestPermission: jest.fn(),
    },
  });
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: function PushManager() {},
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration: jest.fn().mockResolvedValue({
        pushManager: {
          getSubscription: jest.fn().mockResolvedValue(subscription),
        },
      }),
    },
  });
}

function configureBrowserPushRegistration({
  existing,
  created,
  subscribeError,
  permission = "granted",
  requestPermission = "granted",
}: {
  existing: PushSubscription | null;
  created: PushSubscription;
  subscribeError?: Error;
  permission?: NotificationPermission;
  requestPermission?: NotificationPermission;
}) {
  const register = jest.fn().mockResolvedValue(undefined);
  const subscribe = subscribeError
    ? jest.fn().mockRejectedValue(subscribeError)
    : jest.fn().mockResolvedValue(created);
  const activeRegistration = {
    pushManager: {
      getSubscription: jest.fn().mockResolvedValue(existing),
      subscribe,
    },
  };
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: {
      permission,
      requestPermission: jest.fn().mockResolvedValue(requestPermission),
    },
  });
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: function PushManager() {},
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register,
      ready: Promise.resolve(activeRegistration),
      getRegistration: jest.fn().mockResolvedValue({
        pushManager: {
          getSubscription: jest.fn().mockResolvedValue(existing),
        },
      }),
    },
  });

  return { register, subscribe };
}

function configureEndpointHash(hex: string) {
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? [],
  );
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      subtle: {
        digest: jest.fn().mockResolvedValue(bytes.buffer),
      },
    },
  });
}

function createPushSubscription(endpoint: string): PushSubscription {
  return {
    endpoint,
    unsubscribe: jest.fn().mockResolvedValue(true),
    toJSON: () => ({
      endpoint,
      keys: {
        p256dh: "p256dh",
        auth: "auth",
      },
    }),
  } as unknown as PushSubscription;
}

function createIncompletePushSubscription(): PushSubscription {
  return {
    endpoint: "https://push.example/incomplete",
    unsubscribe: jest.fn().mockResolvedValue(true),
    toJSON: () => ({
      endpoint: "https://push.example/incomplete",
      keys: {
        p256dh: "p256dh",
      },
    }),
  } as unknown as PushSubscription;
}
