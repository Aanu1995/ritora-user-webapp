"use client";

import Link from "next/link";
import { CheckCheck, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useAutoLoadMore } from "@/hooks/use-auto-load-more";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { NotificationRow } from "@/components/notifications/notification-row";
import { NotificationsPageSkeleton } from "@/components/notifications/notifications-page-skeleton";

export default function NotificationsPage() {
  const t = useTranslations("notificationsPage");
  const notifications = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  const unread = notifications.data.unread;
  const read = notifications.data.read;
  const unreadCount = notifications.data.unread_count;
  const relativeNowMs = notifications.dataUpdatedAt || null;
  const hasItems = unread.length > 0 || read.length > 0;
  const hasLoadError = notifications.isError && !hasItems;
  const hasLoadMoreError = Boolean(notifications.isFetchNextPageError);
  const canLoadMore = Boolean(notifications.hasNextPage);
  const loadMoreSentinelRef = useAutoLoadMore({
    enabled:
      !notifications.isPending && !hasLoadError && hasItems && !hasLoadMoreError,
    hasNextPage: canLoadMore,
    isFetchingNextPage: notifications.isFetchingNextPage,
    onLoadMore: () => {
      void notifications.fetchNextPage();
    },
  });
  const showAutoLoadState =
    canLoadMore || notifications.isFetchingNextPage || hasLoadMoreError;

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {unread.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                aria-label={t("markAllRead")}
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="w-7 px-0 sm:w-auto sm:px-4"
              >
                {markAll.isPending ? (
                  <LoadingIndicator size="sm" label={t("markingAllRead")} />
                ) : (
                  <>
                    <CheckCheck aria-hidden className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("markAllRead")}
                    </span>
                  </>
                )}
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              size="sm"
              aria-label={t("preferencesAction")}
              className="w-7 px-0 sm:w-auto sm:px-4"
            >
              <Link href={NOTIFICATION_SETTINGS_ROUTE}>
                <Settings2 aria-hidden className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("preferencesAction")}
                </span>
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mx-auto mt-4 w-full lg:w-3/4">
        {notifications.isPending ? (
          <NotificationsPageSkeleton includeHeader={false} />
        ) : hasLoadError ? (
          <RetryPanel
            title={t("errors.loadTitle")}
            description={t("errors.loadBody")}
            actionLabel={t("errors.retry")}
            onAction={() => {
              void notifications.refetch();
            }}
          />
        ) : !hasItems ? (
          <div className="flex min-h-[60dvh] items-center justify-center">
            <div className="w-full rounded-2xl border border-border bg-surface px-6 py-16 text-center">
              <div
                aria-hidden
                className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-accent-soft text-[40px] leading-none"
              >
                🔔
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">
                {t("emptyTitle")}
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
                {t("emptyBody")}
              </p>
              <Link
                href={NOTIFICATION_SETTINGS_ROUTE}
                className="mt-4 inline-block text-sm font-semibold text-accent-strong underline-offset-2 hover:underline"
              >
                {t("managePreferences")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            {unread.length > 0 ? (
              <>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t("unreadHeading")} · {unreadCount}
                </p>
                <div className="space-y-1">
                  {unread.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      nowMs={relativeNowMs}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {read.length > 0 ? (
              <>
                <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t("readHeading")} · {read.length}
                </p>
                <div>
                  {read.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      nowMs={relativeNowMs}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {showAutoLoadState ? (
              <div className="flex flex-col items-center gap-2 pt-4">
                {hasLoadMoreError ? (
                  <>
                    <p className="text-sm text-danger" role="alert">
                      {t("errors.loadMore")}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        void notifications.fetchNextPage();
                      }}
                    >
                      {t("errors.retry")}
                    </Button>
                  </>
                ) : notifications.isFetchingNextPage ? (
                  <LoadingIndicator label={t("loadingMore")} size="sm" />
                ) : null}
                <div
                  ref={loadMoreSentinelRef}
                  data-testid="notifications-auto-load-sentinel"
                  aria-hidden="true"
                  className="h-px w-full"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
