import {
  getNotificationPreferences,
  listPushSubscriptions,
  registerPushSubscription,
  revokePushSubscription,
  updateNotificationPreferences,
} from "@/services/notifications.service";
import {
  PushPlatformValue,
  PushProviderValue,
  type PushSubscriptionRegistration,
} from "@/types/notifications";

const PUSH_SERVICE_WORKER_PATH = "/push-service-worker.js";

export type BrowserPushSupportState =
  | "supported"
  | "unsupported"
  | "denied"
  | "insecure";

export const BrowserPushErrorCode = {
  Unsupported: "unsupported",
  InsecureContext: "insecure_context",
  PermissionDenied: "permission_denied",
  MissingPublicKey: "missing_public_key",
  InvalidPublicKey: "invalid_public_key",
  SubscriptionFailed: "subscription_failed",
  IncompleteSubscription: "incomplete_subscription",
  BackendRegistrationFailed: "backend_registration_failed",
} as const;

export type BrowserPushErrorCode =
  (typeof BrowserPushErrorCode)[keyof typeof BrowserPushErrorCode];

export class BrowserPushError extends Error {
  readonly code: BrowserPushErrorCode;
  readonly detail?: string;

  constructor(code: BrowserPushErrorCode, message: string, detail?: string) {
    super(message);
    this.name = "BrowserPushError";
    this.code = code;
    this.detail = detail;
  }
}

export function getBrowserPushErrorCode(
  error: unknown,
): BrowserPushErrorCode | null {
  if (error instanceof BrowserPushError) {
    return error.code;
  }
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" &&
    Object.values(BrowserPushErrorCode).includes(code as BrowserPushErrorCode)
    ? (code as BrowserPushErrorCode)
    : null;
}

export function getBrowserPushErrorDetail(error: unknown): string | null {
  if (error instanceof BrowserPushError) {
    return error.detail ?? null;
  }
  if (typeof error !== "object" || error === null || !("detail" in error)) {
    return null;
  }

  const detail = (error as { detail?: unknown }).detail;
  return typeof detail === "string" && detail.trim() ? detail : null;
}

export function getBrowserPushSupportState(): BrowserPushSupportState {
  if (!hasBrowserPushCapability()) {
    return "unsupported";
  }
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
    return "insecure";
  }
  return Notification.permission === "denied" ? "denied" : "supported";
}

export async function getCurrentBrowserPushSubscription(): Promise<PushSubscription | null> {
  if (!hasBrowserPushCapability()) {
    return null;
  }
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration(
    PUSH_SERVICE_WORKER_PATH,
  );
  return registration?.pushManager.getSubscription() ?? null;
}

export async function subscribeCurrentBrowserToPush(
  publicKey: string,
): Promise<PushSubscriptionRegistration> {
  const supportState = getBrowserPushSupportState();
  if (supportState === "denied") {
    throw new BrowserPushError(
      BrowserPushErrorCode.PermissionDenied,
      "Browser push permission was not granted.",
    );
  }
  if (supportState === "insecure") {
    throw new BrowserPushError(
      BrowserPushErrorCode.InsecureContext,
      "Browser push requires a secure origin.",
    );
  }
  if (supportState !== "supported") {
    throw new BrowserPushError(
      BrowserPushErrorCode.Unsupported,
      "Browser push is not supported.",
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new BrowserPushError(
      BrowserPushErrorCode.PermissionDenied,
      "Browser push permission was not granted.",
    );
  }

  if (!publicKey.trim()) {
    throw new BrowserPushError(
      BrowserPushErrorCode.MissingPublicKey,
      "Web Push public key is not configured.",
    );
  }
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  await navigator.serviceWorker.register(PUSH_SERVICE_WORKER_PATH);
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  let createdSubscription = false;
  let subscription = existing;
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      createdSubscription = true;
    } catch (error) {
      throw toBrowserPushSubscribeError(error);
    }
  }

  const payload = serializePushSubscription(subscription);
  try {
    await registerPushSubscription(payload);
  } catch (error) {
    if (createdSubscription) {
      await subscription.unsubscribe().catch(() => undefined);
    }
    throw new BrowserPushError(
      BrowserPushErrorCode.BackendRegistrationFailed,
      "Browser push subscription could not be saved.",
      getErrorMessage(error),
    );
  }
  return payload;
}

export async function revokeCurrentBrowserPushSubscription(options: {
  disablePushChannelWhenNoSubscriptionsRemain?: boolean;
} = {}): Promise<void> {
  if (!hasBrowserPushCapability()) {
    return;
  }
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
    return;
  }

  const current = await getCurrentBrowserPushSubscription();
  const endpoint = current?.endpoint ?? null;
  const endpointHash = await hashPushEndpoint(endpoint);
  if (current) {
    await current.unsubscribe().catch(() => undefined);
  }

  if (!endpointHash) {
    return;
  }

  const activeSubscriptions = await listPushSubscriptions().catch(() => []);
  const webSubscriptions = activeSubscriptions.filter(
    (subscription) =>
      subscription.provider === PushProviderValue.WebPush &&
      subscription.platform === PushPlatformValue.Web &&
      subscription.endpoint_hash === endpointHash,
  );

  await Promise.all(
    webSubscriptions.map((subscription) =>
      revokePushSubscription(subscription.id).catch(() => undefined),
    ),
  );

  if (options.disablePushChannelWhenNoSubscriptionsRemain) {
    const remaining = await listPushSubscriptions().catch(() => []);
    if (remaining.length === 0) {
      const preferences = await getNotificationPreferences().catch(() => null);
      if (preferences?.channels.includes("push")) {
        await updateNotificationPreferences({
          channels: preferences.channels.filter((channel) => channel !== "push"),
        }).catch(() => undefined);
      }
    }
  }
}

function hasBrowserPushCapability(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function serializePushSubscription(
  subscription: PushSubscription,
): PushSubscriptionRegistration {
  const json = subscription.toJSON() as {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new BrowserPushError(
      BrowserPushErrorCode.IncompleteSubscription,
      "Browser returned an incomplete push subscription.",
    );
  }

  return {
    provider: PushProviderValue.WebPush,
    platform: PushPlatformValue.Web,
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    device_name: resolveBrowserDeviceName(),
  };
}

export async function hashPushEndpoint(
  endpoint: string | null | undefined,
): Promise<string | null> {
  if (!endpoint || typeof crypto === "undefined" || !crypto.subtle) {
    return null;
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(endpoint),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function resolveBrowserDeviceName(): string {
  if (typeof navigator === "undefined") {
    return "Web browser";
  }
  const browser = navigator.userAgent.includes("Firefox")
    ? "Firefox"
    : navigator.userAgent.includes("Edg/")
      ? "Edge"
      : navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : navigator.userAgent.includes("Safari")
          ? "Safari"
          : "Web browser";
  return `${browser} on web`;
}

function toBrowserPushSubscribeError(error: unknown): BrowserPushError {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "";

  if (name === "NotAllowedError") {
    return new BrowserPushError(
      BrowserPushErrorCode.PermissionDenied,
      "Browser push permission was not granted.",
      message,
    );
  }
  if (name === "SecurityError") {
    return new BrowserPushError(
      BrowserPushErrorCode.InsecureContext,
      "Browser push requires a secure origin.",
      message,
    );
  }
  if (name === "NotSupportedError") {
    return new BrowserPushError(
      BrowserPushErrorCode.Unsupported,
      "Browser push is not supported.",
      message,
    );
  }
  if (
    name === "InvalidAccessError" ||
    /applicationserverkey|vapid|public key/i.test(message)
  ) {
    return new BrowserPushError(
      BrowserPushErrorCode.InvalidPublicKey,
      "Web Push public key is invalid.",
      message,
    );
  }

  return new BrowserPushError(
    BrowserPushErrorCode.SubscriptionFailed,
    "Browser could not create a push subscription.",
    message,
  );
}

function getErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message.trim()
    ? error.message
    : undefined;
}

function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array<ArrayBuffer> {
  const trimmed = base64String.trim();
  const padding = "=".repeat((4 - (trimmed.length % 4)) % 4);
  const base64 = `${trimmed}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  let rawData = "";
  try {
    rawData = window.atob(base64);
  } catch {
    throw new BrowserPushError(
      BrowserPushErrorCode.InvalidPublicKey,
      "Web Push public key is invalid.",
    );
  }
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  if (outputArray.length !== 65 || outputArray[0] !== 4) {
    throw new BrowserPushError(
      BrowserPushErrorCode.InvalidPublicKey,
      "Web Push public key is invalid.",
    );
  }

  return outputArray;
}
