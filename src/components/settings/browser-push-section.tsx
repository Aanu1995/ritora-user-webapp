"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  applyChannelPatchToForm,
  buildPushChannelPatch,
  pickPushScopedChannels,
} from "@/components/settings/browser-push-channel-patch";
import { PushDeviceListSkeleton } from "@/components/settings/browser-push-device-list-skeleton";
import {
  browserPushEnableErrorMessage,
  deviceLabel,
  formatLastSeen,
} from "@/components/settings/browser-push-section.utils";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Switch } from "@/components/ui/switch";
import {
  getCurrentBrowserPushSubscription,
  getBrowserPushSupportState,
  hashPushEndpoint,
  revokeCurrentBrowserPushSubscription,
  subscribeCurrentBrowserToPush,
  type BrowserPushSupportState,
} from "@/lib/browser-push";
import {
  getPushPublicKey,
  getPushStatus,
  listPushSubscriptions,
  revokePushSubscription,
} from "@/services/notifications.service";
import {
  NotificationChannelValue,
  type PushStatusSummary,
  type PushSubscriptionSummary,
} from "@/types/notifications";
import { type SectionProps } from "@/components/settings/notification-form-controls";

export function BrowserPushSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  const locale = useLocale();
  const pushEnabled = values.channels.includes(NotificationChannelValue.Push);
  const [support, setSupport] =
    useState<BrowserPushSupportState>("unsupported");
  const [hasLocalSubscription, setHasLocalSubscription] = useState(false);
  const [currentEndpointHash, setCurrentEndpointHash] = useState<string | null>(
    null,
  );
  const [subscriptions, setSubscriptions] = useState<PushSubscriptionSummary[]>(
    [],
  );
  const [pushStatus, setPushStatus] = useState<PushStatusSummary | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [revokingSubscriptionId, setRevokingSubscriptionId] = useState<
    string | null
  >(null);
  const [isWorking, setIsWorking] = useState(false);
  const busy = isSaving || isWorking || revokingSubscriptionId !== null;
  const deviceBusy = isLoadingDevices || revokingSubscriptionId !== null;

  const refreshDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const [nextSubscriptions, nextStatus] = await Promise.all([
        listPushSubscriptions(),
        getPushStatus().catch(() => null),
      ]);
      setSubscriptions(nextSubscriptions);
      setPushStatus(nextStatus);
    } catch {
      setSubscriptions([]);
      setPushStatus(null);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const supportState = getBrowserPushSupportState();
    setSupport(supportState);
    void (async () => {
      const [subscription, nextSubscriptions, nextStatus] = await Promise.all([
        supportState === "supported"
          ? getCurrentBrowserPushSubscription().catch(() => null)
          : Promise.resolve(null),
        listPushSubscriptions().catch(() => []),
        getPushStatus().catch(() => null),
      ]);
      const endpointHash = await hashPushEndpoint(subscription?.endpoint);
      if (isMounted) {
        setCurrentEndpointHash(endpointHash);
        setHasLocalSubscription(Boolean(subscription));
        setSubscriptions(nextSubscriptions);
        setPushStatus(nextStatus);
        setIsLoadingDevices(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncCurrentBrowserSubscription = async () => {
    const subscription = await getCurrentBrowserPushSubscription().catch(
      () => null,
    );
    setCurrentEndpointHash(await hashPushEndpoint(subscription?.endpoint));
    setHasLocalSubscription(Boolean(subscription));
    return subscription;
  };

  const refreshPushState = async () => {
    await Promise.all([syncCurrentBrowserSubscription(), refreshDevices()]);
  };

  const persistChannels = async (enabled: boolean) => {
    const { nextValues, patch } = buildPushChannelPatch(values, enabled);
    applyChannelPatchToForm(form.setFieldValue, patch);
    const savedPreferences = await persistPatch(nextValues, patch);
    if (savedPreferences) {
      applyChannelPatchToForm(
        form.setFieldValue,
        pickPushScopedChannels(savedPreferences),
      );
    }
    return savedPreferences;
  };

  const maybeDisablePushChannelWhenNoDevicesRemain = async (
    remaining: PushSubscriptionSummary[],
  ) => {
    if (remaining.length === 0 && pushEnabled) {
      await persistChannels(false);
    }
  };

  const removeSubscription = async (subscription: PushSubscriptionSummary) => {
    setRevokingSubscriptionId(subscription.id);
    try {
      const current = await getCurrentBrowserPushSubscription().catch(
        () => null,
      );
      const endpointHash = await hashPushEndpoint(current?.endpoint);
      if (
        current &&
        endpointHash &&
        endpointHash === subscription.endpoint_hash
      ) {
        await current.unsubscribe().catch(() => undefined);
        setCurrentEndpointHash(null);
        setHasLocalSubscription(false);
      }

      await revokePushSubscription(subscription.id);
      const remaining = subscriptions.filter(
        (item) => item.id !== subscription.id,
      );
      setSubscriptions(remaining);
      await maybeDisablePushChannelWhenNoDevicesRemain(remaining);
      toast.success(t("browserPushDeviceRemoved"));
      await refreshDevices();
    } catch {
      toast.error(t("browserPushDeviceRemoveFailed"));
    } finally {
      setRevokingSubscriptionId(null);
    }
  };

  const enablePush = async () => {
    setIsWorking(true);
    try {
      const publicKey = await getPushPublicKey();
      await subscribeCurrentBrowserToPush(publicKey);
      await refreshPushState();
      const savedPreferences = await persistChannels(true);
      if (!savedPreferences?.channels.includes(NotificationChannelValue.Push)) {
        await revokeCurrentBrowserPushSubscription().catch(() => undefined);
        await refreshPushState().catch(() => undefined);
        return;
      }
      toast.success(t("browserPushEnabled"));
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Ritora] Browser push enable failed", error);
      }
      toast.error(browserPushEnableErrorMessage(error, t));
    } finally {
      setIsWorking(false);
    }
  };

  const disablePush = async () => {
    setIsWorking(true);
    try {
      await revokeCurrentBrowserPushSubscription();
      setHasLocalSubscription(false);
      setCurrentEndpointHash(null);
      const savedPreferences = await persistChannels(false);
      if (!savedPreferences) {
        await refreshPushState().catch(() => undefined);
        return;
      }
      toast.success(t("browserPushDisabled"));
      await refreshDevices();
    } catch {
      toast.error(t("browserPushDisableFailed"));
    } finally {
      setIsWorking(false);
    }
  };

  const unavailableMessage =
    support === "unsupported"
      ? t("browserPushUnsupported")
      : support === "denied"
        ? t("browserPushDenied")
        : support === "insecure"
          ? t("browserPushInsecureContext")
          : null;
  const hasDeliveryIssues = Boolean(
    pushStatus &&
    (pushStatus.failing_subscriptions > 0 ||
      pushStatus.pending_retries > 0 ||
      pushStatus.stale_sending > 0),
  );

  const statusMessage =
    unavailableMessage ??
    (pushEnabled
      ? hasLocalSubscription
        ? t("browserPushOn")
        : t("browserPushOnNeedsBrowser")
      : t("browserPushOff"));

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("browserPushTitle")}</p>
        {busy ? (
          <LoadingIndicator
            size="sm"
            label={t("saving")}
            className="inline-flex items-center gap-1.5 text-xs text-muted"
          />
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{t("browserPushBody")}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted">
            {statusMessage}
          </p>
        </div>
        <Switch
          aria-label={t("browserPushTitle")}
          checked={pushEnabled}
          disabled={busy || (!pushEnabled && support !== "supported")}
          onCheckedChange={(checked) => {
            if (checked) {
              void enablePush();
            } else {
              void disablePush();
            }
          }}
        />
      </div>

      {pushEnabled && !hasLocalSubscription && support === "supported" ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void enablePush()}
          >
            {t("browserPushConnect")}
          </Button>
        </div>
      ) : null}

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            {t("browserPushDevicesTitle")}
          </p>
          {deviceBusy ? (
            <LoadingIndicator
              size="sm"
              label={t("saving")}
              className="inline-flex items-center gap-1.5 text-xs text-muted"
            />
          ) : null}
        </div>

        {hasDeliveryIssues && pushStatus ? (
          <p className="mt-2 text-xs leading-snug text-[color:var(--warning)]">
            {t("browserPushDeliveryIssues", {
              failing: pushStatus.failing_subscriptions,
              retries: pushStatus.pending_retries,
            })}
          </p>
        ) : null}

        {isLoadingDevices && subscriptions.length === 0 ? (
          <PushDeviceListSkeleton />
        ) : subscriptions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {t("browserPushDevicesEmpty")}
          </p>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {subscriptions.map((subscription) => {
              const isCurrent =
                Boolean(currentEndpointHash) &&
                subscription.endpoint_hash === currentEndpointHash;
              const isRevoking = revokingSubscriptionId === subscription.id;
              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {deviceLabel(subscription, t)}
                      {isCurrent ? (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {t("browserPushDeviceCurrent")}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatLastSeen(subscription.last_seen_at, locale, t)}
                    </p>
                    {subscription.failure_count > 0 ? (
                      <p className="mt-0.5 text-xs text-[color:var(--warning)]">
                        {t("browserPushDeviceFailures", {
                          count: subscription.failure_count,
                        })}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void removeSubscription(subscription)}
                    className="border-danger text-danger hover:bg-danger/5 hover:text-danger"
                  >
                    {isRevoking
                      ? t("browserPushDeviceRemoving")
                      : t("browserPushDeviceRemove")}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
