"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
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
  const hasItems = unread.length > 0 || read.length > 0;
  const hasLoadError = notifications.isError && !hasItems;
  const hasLoadMoreError = Boolean(notifications.isFetchNextPageError);
  const canLoadMore = Boolean(notifications.hasNextPage);
  const loadMoreSentinelRef = useAutoLoadMore({
    enabled: !notifications.isPending && !hasLoadError && hasItems && !hasLoadMoreError,
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
          unread.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              {markAll.isPending ? (
                <LoadingIndicator size="sm" label={t("markingAllRead")} />
              ) : (
                t("markAllRead")
              )}
            </Button>
          ) : null
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
                href="/settings?tab=notifications"
                className="mt-4 inline-block text-sm font-semibold text-accent-strong underline-offset-2 hover:underline"
              >
                {t("managePreferences")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {unread.length > 0 ? (
              <>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t("unreadHeading")} · {unreadCount}
                </p>
                <div className="space-y-1">
                  {unread.map((n) => (
                    <NotificationRow key={n.id} notification={n} />
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
                  {read.map((n) => (
                    <NotificationRow key={n.id} notification={n} />
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
          </>
        )}
      </div>
    </div>
  );
}
