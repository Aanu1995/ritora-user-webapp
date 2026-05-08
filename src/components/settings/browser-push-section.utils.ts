import type { SectionProps } from "@/components/settings/notification-form-controls";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import {
  BrowserPushErrorCode,
  getBrowserPushErrorCode,
  getBrowserPushErrorDetail,
} from "@/lib/browser-push";
import {
  PushPlatformValue,
  PushProviderValue,
  type PushSubscriptionSummary,
} from "@/types/notifications";

export function browserPushEnableErrorMessage(
  error: unknown,
  t: SectionProps["t"],
): string {
  const apiMessage = getApiErrorMessage(error);
  if (apiMessage) {
    return apiMessage;
  }

  const code = getBrowserPushErrorCode(error);
  if (code === BrowserPushErrorCode.BackendRegistrationFailed) {
    return getBrowserPushErrorDetail(error) ?? t("browserPushRegistrationFailed");
  }
  if (code === BrowserPushErrorCode.InsecureContext) {
    return t("browserPushInsecureContext");
  }
  if (code === BrowserPushErrorCode.PermissionDenied) {
    return t("browserPushPermissionNotGranted");
  }
  if (code === BrowserPushErrorCode.MissingPublicKey) {
    return t("browserPushNotConfigured");
  }
  if (code === BrowserPushErrorCode.InvalidPublicKey) {
    return t("browserPushInvalidPublicKey");
  }
  if (getApiErrorStatus(error) === 503) {
    return t("browserPushNotConfigured");
  }
  if (code === BrowserPushErrorCode.SubscriptionFailed) {
    return t("browserPushSubscriptionFailed");
  }
  return t("browserPushEnableFailed");
}

export function deviceLabel(
  subscription: PushSubscriptionSummary,
  t: SectionProps["t"],
): string {
  if (subscription.device_name) {
    return subscription.device_name;
  }
  if (subscription.provider === PushProviderValue.WebPush) {
    return t("browserPushDeviceWeb");
  }
  if (subscription.platform === PushPlatformValue.Ios) {
    return t("browserPushDeviceIos");
  }
  if (subscription.platform === PushPlatformValue.Android) {
    return t("browserPushDeviceAndroid");
  }
  return t("browserPushDeviceUnknown");
}

export function formatLastSeen(
  value: string | null,
  locale: string,
  t: SectionProps["t"],
): string {
  if (!value) {
    return t("browserPushDeviceNeverSeen");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("browserPushDeviceNeverSeen");
  }
  return t("browserPushDeviceLastSeen", {
    date: new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date),
  });
}
